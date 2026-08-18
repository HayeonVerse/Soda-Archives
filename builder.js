const fs = require("fs");
const path = require("path");


/* =========================================================
   SODA ARCHIVE BUILDER
   ========================================================= */

const ASSETS_DIR = path.join(__dirname, "assets");
const DATA_DIR = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(DATA_DIR, "dahyun.json");


/* =========================================================
   SUPPORTED FILES
   ========================================================= */

const IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif"
];

const VIDEO_EXTENSIONS = [
    ".mp4",
    ".webm",
    ".mov"
];

const LINK_FILES = [
    "link.txt",
    "youtube.txt",
    "tiktok.txt"
];


/* =========================================================
   HELPERS
   ========================================================= */

function normalizePath(filePath) {

    return filePath
        .split(path.sep)
        .join("/");

}


function formatName(name) {

    return name
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );

}


function getMediaType(filename) {

    const extension =
        path.extname(filename).toLowerCase();

    if (IMAGE_EXTENSIONS.includes(extension)) {
        return "image";
    }

    if (VIDEO_EXTENSIONS.includes(extension)) {
        return "video";
    }

    return null;
}


function walkDirectory(directory) {

    let files = [];

    const entries =
        fs.readdirSync(
            directory,
            {
                withFileTypes: true
            }
        );

    for (const entry of entries) {

        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (entry.isDirectory()) {

            files.push(
                ...walkDirectory(fullPath)
            );

        } else {

            files.push(fullPath);

        }
    }

    return files;
}


/* =========================================================
   READ LINK
   ========================================================= */

function readLink(filePath) {

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const text =
        fs.readFileSync(
            filePath,
            "utf8"
        ).trim();

    if (!text) {
        return null;
    }

    return text
        .split(/\r?\n/)
        .map(line => line.trim())
        .find(Boolean) || null;
}


/* =========================================================
   PARSE DATE FOLDER
   ========================================================= */

function parseFolder(relativePath) {

    const parts =
        relativePath.split(path.sep);

    /*
     * Official:
     *
     * source / year / month / day / file
     */

    if (
        parts[0].toLowerCase() !== "fansite"
    ) {

        if (parts.length < 5) {
            return null;
        }

        const source = parts[0];
        const year = parts[1];
        const month = parts[2];
        const day = parts[3];

        if (
            !/^\d{4}$/.test(year) ||
            !/^\d{2}$/.test(month) ||
            !/^\d{2}$/.test(day)
        ) {
            return null;
        }

        return {
            category: "official",
            source: formatName(source),
            date: `${year}-${month}-${day}`
        };
    }


    /*
     * Fansite:
     *
     * fansite / source / year / month / day / file
     */

    if (parts.length < 6) {
        return null;
    }

    const source = parts[1];
    const year = parts[2];
    const month = parts[3];
    const day = parts[4];

    if (
        !/^\d{4}$/.test(year) ||
        !/^\d{2}$/.test(month) ||
        !/^\d{2}$/.test(day)
    ) {
        return null;
    }

    return {
        category: "fansite",
        source: formatName(source),
        date: `${year}-${month}-${day}`
    };
}


/* =========================================================
   GET FOLDER KEY
   ========================================================= */

function getFolderKey(relativePath) {

    const directory =
        path.dirname(relativePath);

    return directory
        .split(path.sep)
        .join("/");
}


/* =========================================================
   BUILD
   ========================================================= */

console.log("");
console.log("🍒 SODA ARCHIVE BUILDER");
console.log("");
console.log("Scanning assets...");
console.log("");


if (!fs.existsSync(ASSETS_DIR)) {

    console.error(
        "❌ assets folder not found."
    );

    process.exit(1);
}


const allFiles =
    walkDirectory(ASSETS_DIR);


/*
 * Group EVERYTHING by date folder.
 */

const folders = new Map();


for (const absolutePath of allFiles) {

    const relativePath =
        path.relative(
            ASSETS_DIR,
            absolutePath
        );

    const folderInfo =
        parseFolder(relativePath);

    if (!folderInfo) {

        console.log(
            `⚠️ Skipping: ${relativePath}`
        );

        continue;
    }


    const folderKey =
        getFolderKey(relativePath);


    if (!folders.has(folderKey)) {

        folders.set(
            folderKey,
            {
                folderInfo,
                files: []
            }
        );

    }


    folders
        .get(folderKey)
        .files
        .push({
            absolutePath,
            relativePath
        });
}


/* =========================================================
   CREATE ARCHIVE
   ========================================================= */

const archive = [];


for (const folder of folders.values()) {

    const info =
        folder.folderInfo;

    const mediaFiles = [];

    const links = {};


    /*
     * Inspect every file in this folder.
     */

    for (const file of folder.files) {

        const filename =
            path.basename(
                file.absolutePath
            );

        const lowercase =
            filename.toLowerCase();


        /*
         * IMAGE / VIDEO
         */

        const media =
            getMediaType(filename);

        if (media) {

            mediaFiles.push({

                media,

                file:
                    normalizePath(
                        path.join(
                            "assets",
                            file.relativePath
                        )
                    )

            });

            continue;
        }


        /*
         * ORIGINAL LINK
         */

        if (lowercase === "link.txt") {

            const url =
                readLink(
                    file.absolutePath
                );

            if (url) {

                links.original =
                    url;

            }

            continue;
        }


        /*
         * YOUTUBE
         */

        if (lowercase === "youtube.txt") {

            const url =
                readLink(
                    file.absolutePath
                );

            if (url) {

                links.youtube =
                    url;

            }

            continue;
        }


        /*
         * TIKTOK
         */

        if (lowercase === "tiktok.txt") {

            const url =
                readLink(
                    file.absolutePath
                );

            if (url) {

                links.tiktok =
                    url;

            }

            continue;
        }
    }


    /*
     * If there are media files,
     * create one entry per media file.
     */

    for (const media of mediaFiles) {

        const item = {

            category:
                info.category,

            type:
                info.category === "fansite"
                    ? "fansite"
                    : info.source
                        .toLowerCase()
                        .replace(/\s+/g, "-"),

            source:
                info.source,

            date:
                info.date,

            media:
                media.media,

            file:
                media.file

        };


        if (
            Object.keys(links).length > 0
        ) {

            item.links =
                links;

        }


        archive.push(item);
    }


    /*
     * If there are NO media files but
     * there ARE links, create a link entry.
     */

    if (
        mediaFiles.length === 0 &&
        Object.keys(links).length > 0
    ) {

        archive.push({

            category:
                info.category,

            type:
                "links",

            source:
                info.source,

            date:
                info.date,

            media:
                "link",

            links:
                links

        });

    }
}


/* =========================================================
   SORT
   ========================================================= */

archive.sort((a, b) => {

    const dateDifference =
        new Date(b.date) -
        new Date(a.date);

    if (dateDifference !== 0) {
        return dateDifference;
    }

    return a.source.localeCompare(
        b.source
    );
});


/* =========================================================
   WRITE JSON
   ========================================================= */

if (!fs.existsSync(DATA_DIR)) {

    fs.mkdirSync(
        DATA_DIR,
        {
            recursive: true
        }
    );
}


const output = {

    generatedAt:
        new Date().toISOString(),

    gallery:
        archive

};


fs.writeFileSync(

    OUTPUT_FILE,

    JSON.stringify(
        output,
        null,
        2
    ),

    "utf8"

);


/* =========================================================
   OUTPUT
   ========================================================= */

console.log(
    `✅ Found ${archive.length} archive entries.`
);

console.log(
    `📁 Generated: data/dahyun.json`
);

console.log("");

console.log("Archive:");
console.log("");


archive.forEach(
    (item, index) => {

        console.log(
            `${index + 1}. ` +
            `${item.date} | ` +
            `${item.category} | ` +
            `${item.source} | ` +
            `${item.media}`
        );


        if (item.links) {

            console.log(
                `   🔗 ${Object.keys(item.links).join(", ")}`
            );

        }

    }
);


console.log("");
console.log("🍒 SODA build complete!");
console.log("");