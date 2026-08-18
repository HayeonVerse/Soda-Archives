document.addEventListener("DOMContentLoaded", () => {

    const galleryGrid =
        document.getElementById("gallery-grid");

    if (!galleryGrid) {
        return;
    }


    /*
     * Load archive data
     */

    fetch("data/dahyun.json")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Could not load dahyun.json"
                );
            }

            return response.json();
        })

        .then(data => {

            const gallery =
                data.gallery || [];


            /*
             * Newest first
             */

            gallery.sort((a, b) => {
                return new Date(b.date) -
                       new Date(a.date);
            });


            /*
             * Create every gallery item
             */

            gallery.forEach(item => {

                createGalleryCard(
                    item,
                    galleryGrid
                );

            });

        })

        .catch(error => {

            console.error(error);

            galleryGrid.innerHTML = `
                <div class="archive-empty">
                    <p>
                        Unable to load the gallery.
                    </p>
                </div>
            `;

        });

});


/* =========================================================
   CREATE GALLERY CARD
   ========================================================= */

function createGalleryCard(item, galleryGrid) {

    const card =
        document.createElement("article");

    card.className = "gallery-card";


    /*
     * MEDIA CONTAINER
     */

    const mediaContainer =
        document.createElement("div");

    mediaContainer.className =
        "gallery-card-image";


    /*
     * OFFICIAL / FANSITE BADGE
     */

    const badge =
        document.createElement("span");

    badge.className =
        `archive-badge ${item.category}`;

    badge.textContent =
        item.category === "official"
            ? "OFFICIAL"
            : "FANSITE";

    mediaContainer.appendChild(badge);


    /*
     * IMAGE
     */

    if (item.media === "image") {

        const image =
            document.createElement("img");

        image.src = item.file;

        image.alt =
            `Seo Dahyun — ${item.source}`;

        image.loading = "lazy";

        mediaContainer.appendChild(image);
    }


    /*
     * VIDEO
     */

    else if (item.media === "video") {

        const video =
            document.createElement("video");

        /*
         * Important:
         * Tell browser this is an MP4 video.
         */

        const source =
            document.createElement("source");

        source.src = item.file;

        source.type = "video/mp4";

        video.appendChild(source);


        /*
         * Browser controls
         */

        video.controls = true;

        video.preload = "metadata";

        video.playsInline = true;


        /*
         * Fallback text
         */

        const fallback =
            document.createElement("p");

        fallback.innerHTML = `
            Your browser cannot play this video.
            <a href="${item.file}">
                Open video
            </a>
        `;

        video.appendChild(fallback);


        mediaContainer.appendChild(video);


        /*
         * Video icon
         */

        const mediaType =
            document.createElement("span");

        mediaType.className =
            "media-type";

        mediaType.textContent = "▶";

        mediaContainer.appendChild(
            mediaType
        );
    }


    /*
     * CARD INFORMATION
     */

    const info =
        document.createElement("div");

    info.className =
        "gallery-card-info";


    /*
     * TITLE
     */

    const title =
        document.createElement("div");

    title.className =
        "gallery-card-title";

    title.textContent =
        item.source;


    /*
     * DATE
     */

    const date =
        document.createElement("div");

    date.className =
        "gallery-card-date";

    date.textContent =
        formatDate(item.date);


    info.appendChild(title);

    info.appendChild(date);


    /*
     * EXTERNAL LINK
     *
     * If this item has a linkFile,
     * load link.txt and create a button.
     */

    if (item.linkFile) {

        loadExternalLink(
            item.linkFile,
            info
        );

    }


    /*
     * BUILD CARD
     */

    card.appendChild(mediaContainer);

    card.appendChild(info);


    /*
     * ADD CARD TO GALLERY
     */

    galleryGrid.appendChild(card);
}


/* =========================================================
   LOAD LINK.TXT
   ========================================================= */

function loadExternalLink(linkFile, container) {

    fetch(linkFile)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Could not load link file"
                );
            }

            return response.text();
        })

        .then(text => {

            /*
             * Remove whitespace/newlines
             */

            const url =
                text.trim();


            /*
             * Don't create a button
             * if link.txt is empty.
             */

            if (!url) {
                return;
            }


            /*
             * Create link button
             */

            const link =
                document.createElement("a");

            link.className =
                "archive-link";

            link.href = url;

            link.target = "_blank";

            link.rel =
                "noopener noreferrer";

            link.textContent =
                "View Original Post ↗";


            container.appendChild(link);

        })

        .catch(error => {

            console.error(
                "Unable to load external link:",
                error
            );

        });
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}
