document.addEventListener("DOMContentLoaded", () => {

    const galleryGrid =
        document.getElementById("gallery-grid");

    if (!galleryGrid) {
        return;
    }

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

            gallery.sort((a, b) => {
                return new Date(b.date) -
                       new Date(a.date);
            });

            gallery.forEach((item, index) => {

                createGalleryCard(
                    item,
                    index,
                    gallery,
                    galleryGrid
                );

            });

            createLightbox();

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

function createGalleryCard(
    item,
    index,
    gallery,
    galleryGrid
) {

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
     * BADGE
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


        /*
         * Open lightbox when clicked
         */

        image.addEventListener(
            "click",
            () => {

                openLightbox(
                    index,
                    gallery
                );

            }
        );


        image.style.cursor = "zoom-in";

        mediaContainer.appendChild(image);
    }


    /*
     * VIDEO
     */

    else if (item.media === "video") {

        const video =
            document.createElement("video");

        const source =
            document.createElement("source");

        source.src = item.file;

        source.type = "video/mp4";

        video.appendChild(source);

        video.controls = true;

        video.preload = "metadata";

        video.playsInline = true;


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
 * LINK-ONLY ENTRY
 */

else if (item.media === "link") {

    const linkCard =
        document.createElement("div");

    linkCard.className =
        "link-only-card";


    const linkIcon =
        document.createElement("div");

    linkIcon.className =
        "link-only-icon";

    linkIcon.textContent = "🔗";


    const linkTitle =
        document.createElement("div");

    linkTitle.className =
        "link-only-title";

    linkTitle.textContent =
        item.source;


    const linkDescription =
        document.createElement("div");

    linkDescription.className =
        "link-only-description";

    linkDescription.textContent =
        "Official content";


    const linkButtons =
        document.createElement("div");

    linkButtons.className =
        "link-only-buttons";


    /*
     * YouTube
     */

    if (
        item.links &&
        item.links.youtube
    ) {

        const youtube =
            document.createElement("a");

        youtube.className =
            "archive-link";

        youtube.href =
            item.links.youtube;

        youtube.target =
            "_blank";

        youtube.rel =
            "noopener noreferrer";

        youtube.textContent =
            "YouTube ↗";

        linkButtons.appendChild(
            youtube
        );

    }


    /*
     * TikTok
     */

    if (
        item.links &&
        item.links.tiktok
    ) {

        const tiktok =
            document.createElement("a");

        tiktok.className =
            "archive-link";

        tiktok.href =
            item.links.tiktok;

        tiktok.target =
            "_blank";

        tiktok.rel =
            "noopener noreferrer";

        tiktok.textContent =
            "TikTok ↗";

        linkButtons.appendChild(
            tiktok
        );

    }


    /*
     * Original post
     */

    if (
        item.links &&
        item.links.original
    ) {

        const original =
            document.createElement("a");

        original.className =
            "archive-link";

        original.href =
            item.links.original;

        original.target =
            "_blank";

        original.rel =
            "noopener noreferrer";

        original.textContent =
            "View Original Post ↗";

        linkButtons.appendChild(
            original
        );

    }


    linkCard.appendChild(
        linkIcon
    );

    linkCard.appendChild(
        linkTitle
    );

    linkCard.appendChild(
        linkDescription
    );

    linkCard.appendChild(
        linkButtons
    );

    mediaContainer.appendChild(
        linkCard
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
     * SOURCE
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
     */

if (item.links) {

    createArchiveLinks(
        item.links,
        info
    );

}

function createArchiveLinks(
    links,
    container
) {

    /*
     * Original post
     */

    if (links.original) {

        createLinkButton(
            links.original,
            "View Original Post ↗",
            container
        );

    }


    /*
     * YouTube
     */

    if (links.youtube) {

        createLinkButton(
            links.youtube,
            "YouTube ↗",
            container
        );

    }


    /*
     * TikTok
     */

    if (links.tiktok) {

        createLinkButton(
            links.tiktok,
            "TikTok ↗",
            container
        );

    }

}


function createLinkButton(
    url,
    text,
    container
) {

    const link =
        document.createElement("a");

    link.className =
        "archive-link";

    link.href =
        url;

    link.target =
        "_blank";

    link.rel =
        "noopener noreferrer";

    link.textContent =
        text;

    container.appendChild(link);

}
    /*
     * BUILD CARD
     */

    card.appendChild(mediaContainer);

    card.appendChild(info);

    galleryGrid.appendChild(card);
}


/* =========================================================
   LIGHTBOX
   ========================================================= */

let lightbox;
let lightboxImage;
let lightboxSource;
let lightboxDate;
let lightboxBadge;
let lightboxCounter;

let currentGallery = [];
let currentIndex = 0;


/*
 * Create lightbox HTML
 */

function createLightbox() {

    lightbox =
        document.createElement("div");

    lightbox.className =
        "lightbox";

    lightbox.innerHTML = `

        <div class="lightbox-backdrop"></div>

        <div class="lightbox-content">

            <button
                class="lightbox-close"
                aria-label="Close"
            >
                ×
            </button>

            <button
                class="lightbox-prev"
                aria-label="Previous"
            >
                ‹
            </button>

            <div class="lightbox-media">

                <img
                    class="lightbox-image"
                    src=""
                    alt=""
                >

            </div>

            <button
                class="lightbox-next"
                aria-label="Next"
            >
                ›
            </button>

            <div class="lightbox-info">

                <div class="lightbox-top">

                    <span
                        class="lightbox-badge"
                    ></span>

                    <span
                        class="lightbox-counter"
                    ></span>

                </div>

                <div
                    class="lightbox-source"
                ></div>

                <div
                    class="lightbox-date"
                ></div>

            </div>

        </div>
    `;


    document.body.appendChild(lightbox);


    /*
     * Get elements
     */

    lightboxImage =
        lightbox.querySelector(
            ".lightbox-image"
        );

    lightboxSource =
        lightbox.querySelector(
            ".lightbox-source"
        );

    lightboxDate =
        lightbox.querySelector(
            ".lightbox-date"
        );

    lightboxBadge =
        lightbox.querySelector(
            ".lightbox-badge"
        );

    lightboxCounter =
        lightbox.querySelector(
            ".lightbox-counter"
        );


    /*
     * Close button
     */

    lightbox
        .querySelector(".lightbox-close")
        .addEventListener(
            "click",
            closeLightbox
        );


    /*
     * Backdrop
     */

    lightbox
        .querySelector(".lightbox-backdrop")
        .addEventListener(
            "click",
            closeLightbox
        );


    /*
     * Previous
     */

    lightbox
        .querySelector(".lightbox-prev")
        .addEventListener(
            "click",
            event => {

                event.stopPropagation();

                showPrevious();

            }
        );


    /*
     * Next
     */

    lightbox
        .querySelector(".lightbox-next")
        .addEventListener(
            "click",
            event => {

                event.stopPropagation();

                showNext();

            }
        );


    /*
     * Keyboard controls
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                !lightbox.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            if (event.key === "Escape") {

                closeLightbox();

            }


            if (event.key === "ArrowLeft") {

                showPrevious();

            }


            if (event.key === "ArrowRight") {

                showNext();

            }

        }
    );
}


/* =========================================================
   OPEN LIGHTBOX
   ========================================================= */

function openLightbox(index, gallery) {

    /*
     * Only include images in lightbox navigation.
     */

    currentGallery =
        gallery.filter(
            item => item.media === "image"
        );


    /*
     * Find the clicked item inside
     * the filtered image gallery.
     */

    const clickedItem =
        gallery[index];

    currentIndex =
        currentGallery.findIndex(
            item =>
                item.file === clickedItem.file
        );


    if (currentIndex === -1) {
        return;
    }


    updateLightbox();


    lightbox.classList.add("active");

    document.body.classList.add(
        "lightbox-open"
    );
}


/* =========================================================
   UPDATE LIGHTBOX
   ========================================================= */

function updateLightbox() {

    const item =
        currentGallery[currentIndex];


    lightboxImage.src =
        item.file;

    lightboxImage.alt =
        `Seo Dahyun — ${item.source}`;


    /*
     * Badge
     */

    lightboxBadge.textContent =
        item.category === "official"
            ? "OFFICIAL"
            : "FANSITE";


    lightboxBadge.className =
        `lightbox-badge ${item.category}`;


    /*
     * Source
     */

    lightboxSource.textContent =
        item.source;


    /*
     * Date
     */

    lightboxDate.textContent =
        formatDate(item.date);


    /*
     * Counter
     */

    lightboxCounter.textContent =
        `${currentIndex + 1} / ${currentGallery.length}`;


    /*
     * Hide navigation when only one image
     */

    const previous =
        lightbox.querySelector(
            ".lightbox-prev"
        );

    const next =
        lightbox.querySelector(
            ".lightbox-next"
        );

    const multiple =
        currentGallery.length > 1;

    previous.style.display =
        multiple ? "flex" : "none";

    next.style.display =
        multiple ? "flex" : "none";
}


/* =========================================================
   PREVIOUS
   ========================================================= */

function showPrevious() {

    if (!currentGallery.length) {
        return;
    }

    currentIndex--;

    if (currentIndex < 0) {

        currentIndex =
            currentGallery.length - 1;

    }

    updateLightbox();
}


/* =========================================================
   NEXT
   ========================================================= */

function showNext() {

    if (!currentGallery.length) {
        return;
    }

    currentIndex++;

    if (
        currentIndex >=
        currentGallery.length
    ) {

        currentIndex = 0;

    }

    updateLightbox();
}


/* =========================================================
   CLOSE LIGHTBOX
   ========================================================= */

function closeLightbox() {

    if (!lightbox) {
        return;
    }

    lightbox.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "lightbox-open"
    );


    /*
     * Clear image after closing
     */

    setTimeout(() => {

        if (
            !lightbox.classList.contains(
                "active"
            )
        ) {

            lightboxImage.src = "";

        }

    }, 250);
}


/* =========================================================
   LOAD LINK.TXT
   ========================================================= */

function loadExternalLink(
    linkFile,
    container
) {

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

            const url =
                text.trim();

            if (!url) {
                return;
            }


            const link =
                document.createElement("a");

            link.className =
                "archive-link";

            link.href =
                url;

            link.target =
                "_blank";

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