$(document).ready(function () {
    function ajaxCall(url, successCallback) {
        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            cache: false,
            success: successCallback,
            error: function (exception) {
                console.error(exception);
            },
        });
    }

    function lazyLoadFadeIn(img) {
        img.dataset.src = img.src;
        img.src = "";
        img.style.opacity = 0;
        img.style.transition = "opacity 0.6s ease-in-out";

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    img.src = img.dataset.src;
                    img.onload = () => (img.style.opacity = 1);
                    obs.unobserve(img);
                }
            });
        });
        observer.observe(img);
    }

    function loadliveevent(bi) {
        $(".sBtn-text").hide();
        ajaxCall("default.aspx/LoadAllEvent", function (data) {
            if (!data || !data.d) return;

            const uniqueGne = [
                ...new Set(data.d.map((item) => item.gne).filter((gne) => gne)),
            ];

            const defaultEventData = [...data.d];

            const $filterMenu = $("<div>")
                .addClass("filter-menu")
                .css({ position: "relative", overflow: "hidden" });

            $("<span>")
                .addClass("filter-item")
                .text("پرستاره")
                .attr("data-rate", "4")
                .css("cursor", "pointer")
                .on("click", function (e) {
                    e.preventDefault();
                    const $allEvents = $(".content-ItemsContiner-Cover");
                    const sortedEvents = $allEvents.get().sort((a, b) => {
                        const rateA = parseFloat($(a).data("rate") || 0);
                        const rateB = parseFloat($(b).data("rate") || 0);
                        return rateB - rateA;
                    });

                    $(".content-ItemsContiner").empty().append(sortedEvents);
                    $(sortedEvents).fadeIn();
                    resetCore();
                    const $globalMenu = $(".global-filter-menu");
                    const $rail = $(".global-filter-rail");
                    const $allBtn = $(".global-filter-item").filter(function () {
                        return $(this).text().trim() === "همه رویدادها";
                    });

                    if ($allBtn.length) {
                        const rect = $allBtn[0].getBoundingClientRect();
                        const parentRect = $globalMenu[0].getBoundingClientRect();
                        $rail.css({
                            width: rect.width + "px",
                            left: rect.left - parentRect.left + "px",
                        });

                        // Optional: visually set active style (without triggering logic)
                        $(".global-filter-item").css("color", "#ccc").removeClass("active");
                        $allBtn.css("color", "#ffcc00");
                    }
                })
                .appendTo($filterMenu);

            $("<span>")
                .addClass("filter-item")
                .text("پرفروش")
                .attr("data-gne", "all")
                .css("cursor", "pointer")
                .on("click", function (e) {
                    e.preventDefault();
                    $(".content-ItemsContiner").empty();
                    defaultEventData.forEach((item) => appendEventItem(item, true));
                    $(".content-ItemsContiner-Cover").fadeIn();
                    $("#calendar").hide();
                    $("#boxw").fadeIn();
                    resetCore();
                    const $globalMenu = $(".global-filter-menu");
                    const $rail = $(".global-filter-rail");
                    const $allBtn = $(".global-filter-item").filter(function () {
                        return $(this).text().trim() === "همه رویدادها";
                    });

                    if ($allBtn.length) {
                        const rect = $allBtn[0].getBoundingClientRect();
                        const parentRect = $globalMenu[0].getBoundingClientRect();
                        $rail.css({
                            width: rect.width + "px",
                            left: rect.left - parentRect.left + "px",
                        });

                        // Optional: visually set active style (without triggering logic)
                        $(".global-filter-item").css("color", "#ccc").removeClass("active");
                        $allBtn.css("color", "#ffcc00");
                    }
                })
                .appendTo($filterMenu);

            uniqueGne
                .filter((gne) => gne.includes("جشنواره"))
                .forEach((gne) => {
                    $("<span>")
                        .addClass("filter-item")
                        .text(" " + gne + " ")
                        .attr("data-gne", gne)
                        .css("cursor", "pointer")
                        .on("click", function (e) {
                            e.preventDefault();
                            $(".content-ItemsContiner-Cover")
                                .hide()
                                .filter(function () {
                                    return $(this).data("gne") === gne;
                                })
                                .fadeIn();
                            resetAfterFilter()
                        })
                        .appendTo($filterMenu);
                });

            uniqueGne
                .filter((gne) => !gne.includes("جشنواره"))
                .forEach((gne) => {
                    $("<span>")
                        .addClass("filter-item")
                        .text(" " + gne + " ")
                        .attr("data-gne", gne)
                        .css("cursor", "pointer")
                        .on("click", function (e) {
                            e.preventDefault();
                            $(".content-ItemsContiner-Cover")
                                .hide()
                                .filter(function () {
                                    return $(this).data("gne") === gne;
                                })
                                .fadeIn();
                            resetAfterFilter()
                            const $globalMenu = $(".global-filter-menu");
                            const $rail = $(".global-filter-rail");
                            const $allBtn = $(".global-filter-item").filter(function () {
                                return $(this).text().trim() === "همه رویدادها";
                            });

                            if ($allBtn.length) {
                                const rect = $allBtn[0].getBoundingClientRect();
                                const parentRect = $globalMenu[0].getBoundingClientRect();
                                $rail.css({
                                    width: rect.width + "px",
                                    left: rect.left - parentRect.left + "px",
                                });

                                // Optional: visually set active style (without triggering logic)
                                $(".global-filter-item").css("color", "#ccc").removeClass("active");
                                $allBtn.css("color", "#ffcc00");
                            }
                        })
                        .appendTo($filterMenu);

                });

            if (data.d.some((item) => item.rw && item.rw.endsWith("."))) {
                $("<span>")
                    .addClass("filter-item")
                    .text(" سایر شهرها ")
                    .attr("data-rw", "rw")
                    .css("cursor", "pointer")
                    .on("click", function (e) {
                        e.preventDefault();
                        $(".content-ItemsContiner-Cover")
                            .hide()
                            .filter(function () {
                                return $(this).data("rw") && $(this).data("rw").endsWith(".");
                            })
                            .fadeIn();
                        resetAfterFilter()
                        const $globalMenu = $(".global-filter-menu");
                        const $rail = $(".global-filter-rail");
                        const $allBtn = $(".global-filter-item").filter(function () {
                            return $(this).text().trim() === "همه رویدادها";
                        });

                        if ($allBtn.length) {
                            const rect = $allBtn[0].getBoundingClientRect();
                            const parentRect = $globalMenu[0].getBoundingClientRect();
                            $rail.css({
                                width: rect.width + "px",
                                left: rect.left - parentRect.left + "px",
                            });


                            $(".global-filter-item").css("color", "#ccc").removeClass("active");
                            $allBtn.css("color", "#ffcc00");
                        }
                    })
                    .appendTo($filterMenu);
            }

            const $searchContainer = $("<div>").addClass("search-filter").css({
                display: "flex",
                alignItems: "center",
                gap: "5px",
                margin: "10px 0",
            });

            const $searchInput = $("<input>")
                .addClass("location-search")
                .attr("placeholder", "جستجو نام یا مکان یا ژانر...")
                .css({
                    padding: "5px",
                    flex: "1",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                });

            const $searchIcon = $("<span>")
                .html("&#128269;")
                .css({ cursor: "pointer", fontSize: "18px" });

            $searchContainer.append($searchInput, $searchIcon).appendTo($filterMenu);

            // === GLOBAL FILTER MENU (Dark Themed + Animated Active Rail) ===
            const $globalMenu = $("<div>")
                .addClass("global-filter-menu")
                .css({
                    display: "flex",
                    justifyContent: "center",
                    position: "relative",
                    background: "#3949a2",
                    borderRadius: "4px",
                    overflow: "hidden",
                    maxWidth: "1080px",
                    margin: "12 auto",
                    width: 'min-content'

                });


            const hasConcert = uniqueGne.some((gne) => gne.includes("اجرا"));
            const hasCinema = uniqueGne.some((gne) => gne.includes("سینما"));
            const hasJog = uniqueGne.some((gne) => gne.includes("جنگ") || gne.includes("جنگ خند"));
            const hasHamayesh = uniqueGne.some((gne) => gne.includes("همایش"));
            const hasOther = uniqueGne.some(
                (gne) =>
                    !gne.includes("اجرا") &&
                    !gne.includes("سینما") &&
                    !gne.includes("جنگ") &&
                    !gne.includes("جنگ خند") &&
                    !gne.includes("همایش")
            );

            // Create animated rail pr-imndst
            const $rail = $("<div>")
                .addClass("global-filter-rail")
                .css({
                    position: "absolute",
                    bottom: "0",
                    height: "3px",
                    background: "#ffcc00",
                    borderRadius: "3px",
                    transition: "all 0.4s ease",
                    width: "0",
                    left: "0",

                });

            $globalMenu.append($rail);

            function makeGlobalButton(label, filterFn) {
                const $btn = $("<span>")
                    .addClass("global-filter-item")
                    .text(label)
                    .css({
                        cursor: "pointer",
                        padding: "8px 8px",
                        color: "#ddd",
                        fontWeight: "500",
                        fontSize: "0.72rem",
                        borderRadius: "6px",
                        transition: "color 0.3s ease",
                        position: "relative",
                        whiteSpace: 'nowrap',
                    })
                    .on("mouseenter", function () {
                        if (!$(this).hasClass("active")) $(this).css("color", "#fff");
                    })
                    .on("mouseleave", function () {
                        if (!$(this).hasClass("active")) $(this).css("color", "#ccc");
                    })
                    .on("click", function (e) {
                        e.preventDefault();

                        // Set active state
                        $(".global-filter-item").removeClass("active").css("color", "#ccc");
                        $(this).addClass("active").css("color", "#ffcc00");

                        // Animate rail
                        const rect = this.getBoundingClientRect();
                        const parentRect = $globalMenu[0].getBoundingClientRect();
                        $rail.css({
                            width: rect.width + "px",
                            left: rect.left - parentRect.left + "px",
                        });

                        // Filter logic
                        $(".content-ItemsContiner-Cover")
                            .hide()
                            .filter(filterFn)
                            .fadeIn(300);
                        resetAfterFilter();
                    });

                return $btn;
            }

            $globalMenu.append(
                makeGlobalButton("همه رویدادها", function () {
                    // Show all items
                    return true;
                })
            );

            if (hasConcert)
                $globalMenu.append(
                    makeGlobalButton("موسیقی", function () {
                        return ($(this).data("gne") || "").includes("اجرا");
                    })
                );

            if (hasCinema)
                $globalMenu.append(
                    makeGlobalButton("سینما", function () {
                        return ($(this).data("gne") || "").includes("سینما");
                    })
                );

            if (hasJog && hasHamayesh) {
                $globalMenu.append(
                    makeGlobalButton("جنگ و همایش‌", function () {
                        const gne = $(this).data("gne") || "";
                        return gne.includes("جنگ") || gne.includes("جنگ خند") || gne.includes("همایش");
                    })
                );
            } else if (hasJog) {
                $globalMenu.append(
                    makeGlobalButton("جنگ خنده", function () {
                        const gne = $(this).data("gne") || "";
                        return gne.includes("جنگ") || gne.includes("جنگ خند");
                    })
                );
            } else if (hasHamayesh) {
                $globalMenu.append(
                    makeGlobalButton("همایش", function () {
                        const gne = $(this).data("gne") || "";
                        return gne.includes("همایش");
                    })
                );
            }






            if (hasOther)
                $globalMenu.append(
                    makeGlobalButton("تئـاتر", function () {
                        const gne = $(this).data("gne") || "";
                        return (
                            !gne.includes("اجرا") &&
                            !gne.includes("سینما") &&
                            !gne.includes("جنگ") &&
                            !gne.includes("جنگ خند") &&
                            !gne.includes("همایش")
                        );
                    })
                );

            // Insert before the local filter menu
            $(".content-ItemsContiner").before($globalMenu);

            // === Optional: Set first button active by default ===
            // === Optional: Set first button active by default ===
            //setTimeout(() => {

            //}, 400);




            $(".content-ItemsContiner").before($filterMenu);

            function performSearch(term, isRetry) {


                term = term.toLowerCase();
                $(".no-results").remove();

                if (!term) {
                    $(".content-ItemsContiner-Cover").fadeIn();
                    return;
                }

                let resultsFound = false;
                $(".content-ItemsContiner-Cover")
                    .hide()
                    .filter(function () {
                        const $el = $(this);
                        const location = ($el.data("location") || "").toLowerCase();
                        const name = $el.find(".header-left").text().toLowerCase();
                        const gne = ($el.data("gne") || "").toLowerCase();
                        const match =
                            location.includes(term) ||
                            name.includes(term) ||
                            gne.includes(term);
                        if (match) resultsFound = true;
                        return match;
                    })
                    .fadeIn();

                if (!resultsFound) {
                    $("<div>")
                        .addClass("no-results")
                        .text("درحال جستجو")
                        .css({
                            textAlign: "center",
                            marginTop: "10px",
                            fontWeight: "bold",
                            color: "gray",
                            fontSize: '0.724rem'
                        })
                        .insertAfter(".filter-menu").delay(5000)
                        .fadeOut(800);;

                    if (!isRetry) {
                        setTimeout(function () {
                            $(".content-ItemsContiner-Cover").fadeIn();
                            $(".no-results").remove();


                            $(".location-search").val("");
                            window.history.replaceState({}, "", window.location.pathname);

                        }, 3000);
                    }
                }

                resetAfterFilter();
                setTimeout(() => {
                    resetAfterFilter();
                }, 1000);
            }


            $searchInput.on("keypress", function (e) {
                if (e.which === 13) {
                    const term = $searchInput.val().trim();
                    performSearch(term, true);
                    if (term) {
                        window.history.pushState(
                            {},
                            "",
                            `?search=${encodeURIComponent(term)}`
                        );
                    } else {
                        window.history.pushState({}, "", window.location.pathname);
                    }
                }
            });

            $searchIcon.on("click", function () {
                const term = $searchInput.val().trim();
                performSearch(term, true);
                if (term) {
                    window.history.pushState(
                        {},
                        "",
                        `?search=${encodeURIComponent(term)}`
                    );
                } else {
                    window.history.pushState({}, "", window.location.pathname);
                }
            });

            const filterMenuEl = document.querySelector(".filter-menu");
            if (filterMenuEl) {
                const scrollWrapper = document.createElement("div");
                scrollWrapper.style.cssText = `
                display:flex;
                overflow-x:auto;
                scroll-behavior:smooth;
                white-space:nowrap;
                padding:0 40px;
                scrollbar-width:none;
                -ms-overflow-style:none;
                user-select:none;
            `;
                while (filterMenuEl.firstChild)
                    scrollWrapper.appendChild(filterMenuEl.firstChild);
                filterMenuEl.appendChild(scrollWrapper);

                const leftBtn = document.createElement("div");
                const rightBtn = document.createElement("div");

                [leftBtn, rightBtn].forEach((btn) => {
                    btn.style.cssText = `
                    position:absolute;
                    top:0; bottom:0;
                    width:30px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    cursor:pointer;
                    font-size:24px;
                    color:#000;
                    z-index:10;
                    background:rgba(255,255,255,0.3);
                    user-select:none;
                    opacity:0;
                    transition: all 0.5s ease;
                `;
                });

                leftBtn.innerHTML = "&#10095;";
                leftBtn.style.left = "0";
                rightBtn.innerHTML = "&#10094;";
                rightBtn.style.right = "0";

                filterMenuEl.style.position = "relative";
                filterMenuEl.append(leftBtn, rightBtn);

                setTimeout(() => {
                    leftBtn.style.opacity = "1";
                    rightBtn.style.opacity = "1";
                }, 2000);

                const scrollAmount = 100;
                leftBtn.addEventListener("click", () =>
                    scrollWrapper.scrollBy({ left: -scrollAmount, behavior: "smooth" })
                );
                rightBtn.addEventListener("click", () =>
                    scrollWrapper.scrollBy({ left: scrollAmount, behavior: "smooth" })
                );
                [leftBtn, rightBtn].forEach((btn) =>
                    btn.addEventListener("mousedown", (e) => e.preventDefault())
                );

                document.addEventListener("keydown", function (e) {
                    if (e.key === "ArrowLeft")
                        scrollWrapper.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                    if (e.key === "ArrowRight")
                        scrollWrapper.scrollBy({ left: scrollAmount, behavior: "smooth" });
                });
            }

            function appendEventItem(item, removeChip = false) {
                const $mainContainer = $("<div>")
                    .addClass("content-ItemsContiner-Cover skeleton-card")
                    .attr({
                        "data-gne": item.gne,
                        "data-location": item.location,
                        "data-rate": item.rate || 0,
                    });

                if (item.rw) $mainContainer.attr("data-rw", item.rw);

                const $itemDiv = $("<div>").addClass("content-ItemsContiner-item");

                const $imageLink = $("<a>").attr("href", "e?m=" + item.id);
                const $img = $("<img>").attr({
                    alt: item.name,
                    src: "https://gishot.ir/" + item.src,
                });

                $imageLink.append($img);

                if (!removeChip && item.rate && item.rate > 0) {
                    const $chip = $("<div>").addClass("rate-chip").text(item.rate).css({
                        position: "absolute",
                        top: "5px",
                        left: "5px",
                        background: "#FFD700",
                        color: "#000",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        zIndex: 10,
                    });
                    $itemDiv.append($chip);
                    $itemDiv.css("position", "relative");
                }

                $itemDiv.append($imageLink);
                lazyLoadFadeIn($img[0]);

                if (item.rw && /^-?\d+:-?\d+:-?\d+$/.test(item.rw)) {
                    let [hours, minutes, seconds] = item.rw.split(":").map(Number);
                    if (!(hours < 0 || minutes < 0 || seconds < 0)) {
                        const $ribbon = $("<div>").addClass("ribbonwarp").text(item.rw);
                        $itemDiv.append($ribbon);

                        const timerInterval = setInterval(() => {
                            if (seconds > 0) seconds--;
                            else if (minutes > 0) {
                                minutes--;
                                seconds = 59;
                            } else if (hours > 0) {
                                hours--;
                                minutes = 59;
                                seconds = 59;
                            }

                            const formattedTime = [hours, minutes, seconds]
                                .map((n) => n.toString().padStart(2, "0"))
                                .join(":");
                            $ribbon.text(formattedTime);

                            if (hours === 0 && minutes === 0 && seconds === 0)
                                clearInterval(timerInterval);
                        }, 1000);
                    }
                } else if (item.rw && !item.rw.includes("-")) {
                    $("<div>").addClass("ribbonwarp").text(item.rw).appendTo($itemDiv);
                }

                const displayName =
                    item.name.length > 13
                        ? item.name.substring(0, 13) + "..."
                        : item.name;
                const $nameBox = $("<div>")
                    .addClass("content-ItemsContiner-item-name box")
                    .append(
                        $("<a>")
                            .addClass("header-left")
                            .text(displayName)
                            .attr("href", "e?m=" + item.id)
                            .css("cursor", "pointer")
                    );

                $itemDiv.append($nameBox);
                $mainContainer.append($itemDiv);
                $(".content-ItemsContiner").append($mainContainer);
            }

            function lazyLoadFadeIn(img) {
                img.dataset.src = img.src;
                img.src = "";
                img.style.opacity = 0;
                img.style.transition = "opacity 0.6s ease-in-out";

                const observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            img.src = img.dataset.src;
                            img.onload = () => (img.style.opacity = 1);
                            obs.unobserve(img);
                        }
                    });
                });
                observer.observe(img);
            }

            defaultEventData.forEach((item) => appendEventItem(item));

            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get("search");
            if (searchQuery) {
                const decodedQuery = decodeURIComponent(searchQuery);
                $searchInput.val(decodedQuery);
                performSearch(decodedQuery, false);

            }

            $("#skeleton-loader").fadeOut();

            $("#liveevent").fadeIn();
            if (bi) {
                loadBox();
                loadProfile();
                slide()
            }
        });

        function resetAfterFilter() {
            $(".custom-banner").remove();
            $(".content-ItemsContiner").addClass("fullwidth-mobile");
        }
        function resetCore() {
            $(".custom-banner").remove();
            $(".content-ItemsContiner").removeClass("fullwidth-mobile");
        }
    }

    function loadBox() {
        ajaxCall("default.aspx/box", function (data) {
            var m = document.createElement("div");
            var spmain = document.createElement("div");
            spmain.innerHTML = "آمار روی صحنه";
            spmain.className = "stati";
            m.append(spmain);

            var u = document.createElement("ol");
            var elements = [];

            $.each(data.d, function (v, l) {
                var b = document.createElement("li");
                b.className = "rgul";
                var bname = document.createElement("span");
                var bcount = document.createElement("span");
                var timec = document.createElement("span");
                var timeday = document.createElement("span");
                var timelast = document.createElement("span");
                var timejet = document.createElement("span");
                var bxo = document.createElement("span");

                bname.innerHTML = l.name + " : ";
                bcount.innerHTML =
                    '<span class="numberx"> ' + l.count + "</span> بلیت ";

                if (l.timeCount < 7) {
                    timec.innerHTML = '<span class="nmnew"> جدید </span>';
                } else {
                    timec.innerHTML =
                        '<span class="number2"> ' + l.timeCount + "</span> سانس ";
                }

                if (l.timeCount < 4 && l.count > 20) {
                    timejet.innerHTML = '<span class="nmnew"> + </span>';
                }

                if (l.timeCount < 11 && l.count > 400) {
                    timejet.innerHTML = '<span class="nmnew"> ++ </span>';
                }

                if (l.price != null) {
                    bxo.innerHTML = '<span class="nmnew">' + l.price + " </span>";
                    b.appendChild(bxo);
                }

                timeday.innerHTML = l.rate + " بلیت آنلاین امروز ";
                timelast.innerHTML = " پیش  " + l.time + " اخرین خرید در دقیقه";

                b.appendChild(bname);
                b.appendChild(bcount);
                b.appendChild(timec);
                b.appendChild(timejet);

                u.appendChild(b);
                elements.push($(b));
            });

            m.appendChild(u);
            $("#boxw").append(m);

            let delay = 0;
            $.each(elements, function (index, el) {
                el.hide().delay(delay).fadeIn(400);
                delay += 200;
            });

            setInterval(function () {
                const randomIndex = Math.floor(Math.random() * elements.length);
                const randomElement = elements[randomIndex];

                randomElement.animate({ transform: "scale(1.2)" }, 400, function () {
                    $(this).animate({ transform: "scale(1)" }, 400);
                });

                randomElement.addClass("shake");
                setTimeout(() => {
                    randomElement.removeClass("shake");
                }, 500);
            }, 2000);
        });
    }

    function slide() {
        ajaxCall("default.aspx/slider", function (data) {
            if (!data || !data.d || !data.d.length) return;

            const $owlContainer = $(".owl-one");
            $owlContainer.empty();

            data.d.forEach(item => {
                const a = document.createElement("a");
                a.href = "e?m=" + item.Id;

                const img = document.createElement("img");
                img.src = 'https://gishot.ir/' + item.imgdesk;

                const tik = document.createElement("span");
                tik.className = "outbuy";
                tik.textContent = "بلیت";

                a.appendChild(img);
                a.appendChild(tik);

                $owlContainer.append(a);
            });

            $owlContainer.owlCarousel({
                margin: 10,
                center: true,
                stagePadding: 50,
                autoplay: true,
                autoplayTimeout: 4000,
                autoplayHoverPause: true,
                loop: true,
                items: 2,
                responsive: {
                    0: { items: 1 },
                    600: { items: 2 },
                    1000: { items: 2 },
                },
            });

            if (window.matchMedia("(max-width: 768px)").matches) {
                insertDynamicMobileBanners(data.d);
            }
        });
    }

    function loadProfile() {
        $(".sBtn-text").hide();
        ajaxCall("default.aspx/LoadAllProfile", function (data) {
            var uniqueGne = [
                ...new Set(data.d.map((item) => item.gne).filter((gne) => gne !== "")),
            ];
            var $filterMenu = $("<div>").addClass("filter-menu");

            var $showAllFilter = $("<span>")
                .addClass("filter-item")
                .text("همه هنرمندان")
                .attr("data-gne", "all")
                .css("cursor", "pointer")
                .click(function (event) {
                    event.preventDefault();
                    $(".content-ItemsContiner-Cover-ser").show();
                });

            $filterMenu.append($showAllFilter);

            uniqueGne.forEach(function (gne) {
                var $filterItem = $("<span>")
                    .addClass("filter-item")
                    .text(" " + gne + " ")
                    .attr("data-gne", gne)
                    .css("cursor", "pointer")
                    .click(function (event) {
                        event.preventDefault();
                        $(".content-ItemsContiner-Cover-ser").hide();
                        $(".content-ItemsContiner-Cover-ser")
                            .filter(function () {
                                return $(this).data("gne") === gne;
                            })
                            .show();
                    });

                $filterMenu.append($filterItem);
            });

            var hasRwItems = data.d.some((item) => item.rw);
            if (hasRwItems) {
                var $rwFilterItem = $("<span>")
                    .addClass("filter-item")
                    .text(" سایر شهرها ")
                    .attr("data-rw", "rw")
                    .css("cursor", "pointer")
                    .click(function (event) {
                        event.preventDefault();
                        $(".content-ItemsContiner-Cover-ser").hide();
                        $(".content-ItemsContiner-Cover-ser")
                            .filter(function () {
                                return $(this).data("rw") !== undefined;
                            })
                            .show();
                    });

                $filterMenu.append($rwFilterItem);
            }

            $(".content-ItemsContiner-Cover-ser").before($filterMenu);

            var limitedData = data.d.slice(0, 10);

            limitedData.forEach(function (item) {
                var $mainContainer = $("<div>")
                    .addClass("content-ItemsContiner-Cover-ser")
                    .attr("data-gne", item.gne);

                if (item.rw) {
                    $mainContainer.attr("data-rw", item.rw);
                }

                var $itemDiv = $("<div>").addClass("content-ItemsContiner-item");

                var $imageLink = $("<a>")
                    .attr("href", "https://gishot.ir/igish?id=" + item.id)
                    .append(
                        $("<img>")
                            .attr("alt", item.name)
                            .attr("src", "https://gishot.ir/" + item.src)
                            .css("opacity", "1")
                    );

                if (item.rw) {
                    var $ribbon = $("<div>").addClass("ribbonwarp").text(item.rw);
                    $itemDiv.append($ribbon);
                }

                $itemDiv.append($imageLink);

                var displayName =
                    item.name.length > 13
                        ? item.name.substring(0, 13) + "..."
                        : item.name;
                var $nameBox = $("<div>")
                    .addClass("content-ItemsContiner-item-name-p box")
                    .append(
                        $("<a>")
                            .addClass("header-left-p")
                            .text(displayName)
                            .attr("href", "https://gishot.ir/igish?id=" + item.id)
                            .css("cursor", "pointer")
                    );

                $itemDiv.append($nameBox);

                var $nameDet = $("<div>")
                    .addClass("content-ItemsContiner-item-name det")
                    .append($("<span>").addClass("header-rate").text(item.rate));

                $mainContainer.append($itemDiv);
                $(".content-ItemsContiner-ser").append($mainContainer);
            });

            var $seeMoreLink = $("<a>")
                .attr("href", "https://gishot.ir/in")
                .addClass("see-more-link")
                .text("نمایش همه")
                .css("display", "block")
                .css("text-align", "center")
                .css("margin", "20px 0")
                .css("cursor", "pointer");

            $(".content-ItemsContiner-ser").append($seeMoreLink);

            $("#profile").show();
        });
    }

    loadliveevent(true);
    let currentIndex = -1;
    let stories = [];

    function loadStory() {
        ajaxCall("default.aspx/GetStoryData", function (data) {
            var $storyContainer = $("#storyContainer");
            stories = JSON.parse(data.d);

            stories.forEach(function (story, index) {
                var $storyItem = $("<div>").addClass("story-item");

                var $image = $("<img>")
                    .attr(
                        "src",
                        story.imgmob
                            ? "https://gishot.ir/" + story.imgmob
                            : "path/to/placeholder-image.jpg"
                    )
                    .attr("alt", story.ProgramName);

                var $title = $("<h3>").text(story.ProgramName);
                var $description = $("<p>").text(
                    story.description || "No description available"
                );

                $storyItem.append($image, $title, $description);

                $storyContainer.append($storyItem);

                $storyItem.on("click", function () {
                    openModal(index);
                });
            });
        });
    }

    function openModal(index) {
        const story = stories[index];

        $("#modalImage").attr(
            "src",
            story.imgmob
                ? "https://gishot.ir/" + story.imgmob
                : "path/to/placeholder-image.jpg"
        );
        $("#modalTitle").text(story.ProgramName);

        $("#storyModal").fadeIn();

        currentIndex = index;

        toggleNavButtons();
    }

    function toggleNavButtons() {
        $("#prevBtn").prop("disabled", currentIndex === 0);
        $("#nextBtn").prop("disabled", currentIndex === stories.length - 1);
    }

    function nextStory(e) {
        e.preventDefault();
        if (currentIndex < stories.length - 1) {
            openModal(currentIndex + 1);
        } else {
            closeModal();
        }
    }

    function prevStory(e) {
        e.preventDefault();
        if (currentIndex > 0) {
            openModal(currentIndex - 1);
        }
    }

    $(".close-btn").on("click", function () {
        closeModal();
    });

    function closeModal() {
        $("#storyModal").fadeOut();
    }

    $("#nextBtn").on("click", nextStory);
    $("#prevBtn").on("click", prevStory);

    $(document).on({
        ajaxStart: function () {
            $(".fa-spin").show();
        },
        ajaxStop: function () {
            $(".fa-spin").hide();
            $(".sBtn-text").show();
        },
    });

    function openCalendarm() {
        $.ajax({
            type: "POST",
            url: "default.aspx/GetProgramData",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                var events = response.d;
                renderCalendar(events);
            },
            error: function (xhr, status, error) {
                console.log("Error: " + error);
            },
        });

        function renderCalendar(events) {
            var calendarDiv = $("#calendar");
            var today = new Date();
            var eventsByDate = {};

            events.forEach(function (event) {
                var date = event.PersianTime.split(" ")[0];
                if (!eventsByDate[date]) {
                    eventsByDate[date] = [];
                }
                eventsByDate[date].push(event);
            });

            calendarDiv.empty();

            var sortedEvents = [];
            for (var date in eventsByDate) {
                eventsByDate[date].sort(function (a, b) {
                    return a.PersianTime.localeCompare(b.PersianTime);
                });
                sortedEvents.push({ date: date, events: eventsByDate[date] });
            }

            sortedEvents.forEach(function (dayData) {
                var persianDateFormatted = convertToPersianDate(dayData.date);
                var dayDiv = $('<div class="calendar-day"></div>');

                dayDiv.append(
                    `<h5 class="text-center">${persianDateFormatted.date}</h5>`
                );

                dayData.events.forEach(function (event) {
                    var persianTime = event.PersianTime.split(" ")[1];
                    var eventLink = `https://gishot.ir/e?m=${event.id}`;

                    var eventBox = `
                    <div class="event-box">
                        <h6 class="event-name">${event.ProgramName}</h6>
                        <p class="event-time">${persianTime}</p>
                        <a href="${eventLink}" target="_blank" class="event-link">بلیت</a>
                    </div>
                `;
                    dayDiv.append(eventBox);
                });

                calendarDiv.append(dayDiv);
            });
        }

        function convertToPersianDate(gregorianDate) {
            var persianMonths = [
                "فروردین",
                "اردیبهشت",
                "خرداد",
                "تیر",
                "مرداد",
                "شهریور",
                "مهر",
                "آبان",
                "آذر",
                "دی",
                "بهمن",
                "اسفند",
            ];
            var persianDays = [
                "یکشنبه",
                "دوشنبه",
                "سه‌شنبه",
                "چهارشنبه",
                "پنج‌شنبه",
                "جمعه",
                "شنبه",
            ];

            var dateParts = gregorianDate.split("/");
            var year = parseInt(dateParts[0], 10);
            var month = parseInt(dateParts[1], 10) - 1;
            var day = parseInt(dateParts[2], 10);

            var gregorianDateObj = new Date(year, month, day);
            var persianDate = convertToPersian(gregorianDateObj);

            return {
                day: persianDays[gregorianDateObj.getDay()],
                date: `${persianDate.day} ${persianMonths[persianDate.month]}`,
                year: persianDate.year,
                month: persianDate.month,
                day: persianDate.day,
            };
        }

        function convertToPersian(date) {
            var gregorian = date;
            var persianDate = new Date(gregorian);

            var persianYear = gregorian.getFullYear() - 621;
            var persianMonth = gregorian.getMonth();
            var persianDay = gregorian.getDate();

            return {
                year: persianYear,
                month: persianMonth,
                day: persianDay,
            };
        }
    }

    var $calendarFilterItem = $("<span>")
        .addClass("filter-item")
        .text("تقویم گیشات")
        .attr("data-calendar", "calendar")
        .css("cursor", "pointer")
        .click(function (event) {
            event.preventDefault();
            openCalendar();
        });

    $(".filter-menu").append($calendarFilterItem);

    function insertDynamicMobileBanners(sliderData) {
        const liveEvents = document.getElementById("liveEvents");
        const items = liveEvents.querySelectorAll(".content-ItemsContiner-item");

        const insertBannerAfter = (index, imgSrc, href, uniqueId) => {
            if (items.length > index && !document.querySelector(`.custom-banner-${uniqueId}`)) {
                const targetItem = items[index];
                const parentCover = targetItem.closest(".content-ItemsContiner-Cover");

                const banner = document.createElement("div");
                banner.className = `custom-banner custom-banner-${uniqueId}`;
                banner.innerHTML = `
        <a href="${href}" target="_blank" rel="noopener">
          <img src="https://gishot.ir/${imgSrc}" alt="Mobile Banner">
        </a>
      `;
                parentCover.insertAdjacentElement("afterend", banner);
            }
        };

        const positions = [5, 11, 17];

        positions.forEach((pos, i) => {
            if (sliderData[i]) {
                const item = sliderData[i];
                insertBannerAfter(pos, item.imgdesk, "e?m=" + item.Id, `banner${i + 1}`);
            }
        });

        if (!document.querySelector("#custom-banner-styles")) {
            const style = document.createElement("style");
            style.id = "custom-banner-styles";
            style.textContent = `
      @media (max-width: 768px) {
        .custom-banner {
          grid-column: 1 / -1;
          width: 100%;
          margin: 16px 0;
          border-radius: 10px;
          overflow: hidden;
          text-align: center;
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        }
        .custom-banner img {
          width: 100%;
          height: auto;
          display: block;
        }
      }
    `;
            document.head.appendChild(style);
        }
    }

});


//devloped by a.imndst @gishot 2014