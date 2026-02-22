$(document).ready(function () {
    var t = !1;
    $("#UserForm").hide(), $(".dspanel").hide();
    var e,
        n,
        s,
        r,
        o,
        d,
        l,
        c,
        p,
        h,
        f = !0,
        m = !1,
        v = $("#ContentPlaceHolder1_Hmi").val(),
        g = $("#ContentPlaceHolder1_Hsi").val(),
        C = !1;
    function y(a) {
        a = a.replace(/\,/g, "");
        for (var t = new RegExp("(-?[0-9]+)([0-9]{3})"); t.test(a);)
            a = a.replace(t, "$1,$2");
        if (taxis == 1) {
        }
        return a;
    }
    function x(a, t, e, up) {
        var n = $(".orgincell").length,
            s = $(".TempCell").length,
            r = $(".rescell").length,
            o = parseInt(n + s + r);
        for (i = 0; i <= o; i++)
            $('span[data-id="' + i + '"]').hasClass("TempCell") &&
                ($('span[data-id="' + i + '"]').removeClass("TempCell"),
                    $('span[data-id="' + i + '"]').addClass("orgincell")),

                -1 != $.inArray(i, a) &&
                ($('span[data-id="' + i + '"]').removeClass("orgincell"),
                    $('span[data-id="' + i + '"]').addClass("rescell")),

                -1 != $.inArray(i, t) &&
                ($('span[data-id="' + i + '"]').removeClass("orgincell"),
                    $('span[data-id="' + i + '"]').addClass("TempCell")),

                -1 != $.inArray(i, e) &&
                ($('span[data-id="' + i + '"]').removeClass("orgincell"),
                    $('span[data-id="' + i + '"]').addClass("RTempCell")),


                -1 != $.inArray(i, up) && ($('span[data-id="' + i + '"]').removeClass("rescell"),
                    $('span[data-id="' + i + '"]').addClass("rescell PerCell"));

    }

    function M(a, t) {
        $.ajax({
            type: "POST",
            url: "stage.aspx/SendPublicLinkTojquery",
            data: "{MidLA: '" + a + "',SidLA:'" + t + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: "true",
            cache: "false",
            success: function (a) {
                var t = a.d.AllSeat,
                    e = $.map(t.split(","), function (a) {
                        return parseInt(a, 10);
                    }),
                    n = a.d.TempSeat,
                    s = $.map(n.split(","), function (a) {
                        return parseInt(a, 10);
                    }),
                    r = a.d.soseat,
                    i = $.map(r.split(","), function (a) {
                        return parseInt(a, 10);
                    });

                pro = a.d.Priotres,
                    ipro = $.map(pro.split(","), function (a) {
                        return parseInt(a, 10);
                    });

                (PublicLink = e), (sLink = []), (TemPcLink = s), (soslink = i), (Periotlink = ipro), x(PublicLink, TemPcLink, soslink, Periotlink);



                var o = $(".orgincell").last().attr("data-row");
                $(".seatarea").css("height", 20 * o + 160 + "px");
            },
            complete: function () { },
            error: function (a, t, e) { },
        });
    }



    var taxis = 0;
    function T() {
        $.ajax({
            type: "POST",
            url: "stage.aspx/Rcurentp",
            data: "{psans:'" + g + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: "true",
            cache: "false",
            success: function (a) {
                if (a.d == "enTax") {
                    taxis = 1;
                    // $(".left-pay").append(
                    //     "<br/>به مبلغ 10 درصد ارزش افزوده اضافه شده است"
                    // );
                }
                if (a.d == "enFee") {
                    $(".left-pay").append(
                        "<br/>به مبلغ 5 درصد هزینه خدمات آنلاین اضافه میشود"
                    );
                }
            },
            error: function (a) {
                $(".orgincell").removeClass("ris2"),
                    $("#HowMuch").html("خطای ارتباطی لطفا خط اینترنت را بررسی کنید");
            },
        });
    }
    $(document).on({
        ajaxStart: function () {
            !C &&
                f &&
                ($("#smooth").hide(),
                    $(".owlmy").show(),
                    $(".modal-window").hide(),
                    $("#UserForm").hide()),
                f || $(".fa-spin").show(),
                m &&
                ($(".fa-spin").show(), $("#nextstage").css("pointer-events", "none"));
        },
        ajaxStop: function () {
            if (!C && f) {
                $(".owlmy").hide(),
                    $("#smooth").show(),
                    $(".modal-window").show(),
                    m &&
                    ($("#UserForm").show(),
                        $(".fa-spin").hide(),
                        $("#nextstage").css("pointer-events", "auto")),
                    $(".dspanel").show();
                var a = $(".showplace"),
                    t = $(".seatarea"),
                    e = a.width();
                /*  $(".seatarea").animate({ scrollLeft: e / 3 - t / 2 });*/
                $(".seatarea").animate({
                    scrollLeft: $(".seatarea").scrollLeft() - 1400,
                });

                $(".seatarea").animate({
                    scrollLeft: $(".seatarea").scrollLeft() + 1400,
                });
            }
            f || $(".fa-spin").hide();
        },
    }),
        (Arrid = []),
        T();
    var A = 0,
        k = document.createElement("span");
    $("#payx").append(k);
    var j,
        w,
        S,
        H = [
            ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"],
            [
                "ده",
                "یازده",
                "دوازده",
                "سیزده",
                "چهارده",
                "پانزده",
                "شانزده",
                "هفده",
                "هجده",
                "نوزده",
                "بیست",
            ],
            ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"],
            [
                "",
                "یکصد",
                "دویست",
                "سیصد",
                "چهارصد",
                "پانصد",
                "ششصد",
                "هفتصد",
                "هشتصد",
                "نهصد",
            ],
            [
                "",
                " هزار",
                " میلیون",
                " میلیارد",
                " بیلیون",
                " بیلیارد",
                " تریلیون",
                " تریلیارد",
                "کوآدریلیون",
                " کادریلیارد",
                " کوینتیلیون",
                " کوانتینیارد",
                " سکستیلیون",
                " سکستیلیارد",
                " سپتیلیون",
                "سپتیلیارد",
                " اکتیلیون",
                " اکتیلیارد",
                " نانیلیون",
                " نانیلیارد",
                " دسیلیون",
                " دسیلیارد",
            ],
        ],
        P = [
            "",
            "دهم",
            "صدم",
            "هزارم",
            "ده‌هزارم",
            "صد‌هزارم",
            "میلیونوم",
            "ده‌میلیونوم",
            "صدمیلیونوم",
            "میلیاردم",
            "ده‌میلیاردم",
            "صد‌‌میلیاردم",
        ],
        D = function (a) {
            if (0 === parseInt(a, 0)) return "";
            var t = parseInt(a, 0);
            if (t < 10) return H[0][t];
            if (t <= 20) return H[1][t - 10];
            if (t < 100) {
                var e = t % 10,
                    n = (t - e) / 10;
                return e > 0 ? H[2][n] + " و " + H[0][e] : H[2][n];
            }
            var s = t % 10,
                r = (t - (t % 100)) / 100,
                i = (t - (100 * r + s)) / 10,
                o = [H[3][r]],
                d = 10 * i + s;
            return (
                d > 0 &&
                (d < 10
                    ? o.push(H[0][d])
                    : d <= 20
                        ? o.push(H[1][d - 10])
                        : (o.push(H[2][i]), s > 0 && o.push(H[0][s]))),
                o.join(" و ")
            );
        },
        L = function (a) {
            if (((a = a.toString().replace(/[^0-9.]/g, "")), isNaN(parseFloat(a))))
                return "صفر";
            var t = "",
                e = a,
                n = a.indexOf(".");
            if (
                (n > -1 &&
                    ((e = a.substring(0, n)), (t = a.substring(n + 1, a.length))),
                    e.length > 66)
            )
                return "خارج از محدوده";
            for (
                var s = (function (a) {
                    var t = a;
                    "number" == typeof t && (t = t.toString());
                    var e = t.length % 3;
                    return (
                        1 === e ? (t = "00".concat(t)) : 2 === e && (t = "0".concat(t)),
                        t.replace(/\d{3}(?=\d)/g, "$&*").split("*")
                    );
                })(e),
                r = [],
                i = s.length,
                o = 0;
                o < i;
                o += 1
            ) {
                var d = H[4][i - (o + 1)],
                    l = D(s[o]);
                "" !== l && r.push(l + d);
            }
            return (
                t.length > 0 &&
                (t = (function (a) {
                    return "" === (a = a.replace(/0*$/, ""))
                        ? ""
                        : (a.length > 11 && (a = a.substr(0, 11)),
                            " ممیز " + L(a) + " " + P[a.length]);
                })(t)),
                r.join(" و ") + t
            );
        };

    function O() {
        for (
            var a = 1,
            t = $(".orgincell").length,
            e = $(".rescell").length,
            n = $(".TempCell").length,
            s = $(".ris2").first().attr("data-id"),
            r = $(".ris2").last().attr("data-id"),
            i = (parseInt(t + e + n), s);
            i <= r;
            i++
        ) {
            var o = $('span[data-id="' + i + '"]'),
                d = o.next(),
                l = d.next(),
                c = $('span[data-id="' + i + '"]'),
                p = c.prev(),
                u = p.prev();
            !o.hasClass("ris2") ||
                d.hasClass("ris2") ||
                l.hasClass("TableHeader") ||
                !d.hasClass("orgincell") ||
                (l.hasClass("orgincell") && !l.hasClass("ris2")) ||
                a++,
                !c.hasClass("ris2") ||
                u.hasClass("TableHeader") ||
                p.hasClass("ris2") ||
                !p.hasClass("orgincell") ||
                u.hasClass("orgincell") ||
                a++;
        }
        return a;
    }
    function I(a, t) {
        GChainOfSeat = Arrid;
        $.ajax({
            type: "POST",
            url: "stage.aspx/isdiscount",
            data:
                "{mid: '" +
                a +
                "',isdiscount:'" +
                t +
                "',chain:'" +
                GChainOfSeat +
                "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: "true",
            cache: "false",
            success: function (a) {
                $.notify(a.d.oknook, "info");
                var t = a.d.aftersed,
                    e = A - (A * t) / 100;
                $("#afterseat").html(y(e.toString()) + "ریال");
            },
            complete: function () { },
            error: function (a, t, e) { },
        });
    }
    function U(a, e) {
        GChainOfSeat = Arrid;
        $.ajax({
            type: "POST",
            url: "stage.aspx/realdiscount",
            data:
                "{mid: '" +
                a +
                "',isdiscount:'" +
                e +
                "',chain:'" +
                GChainOfSeat +
                "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: "false",
            success: function (a) {
                t = a.d.oknook;
            },
            async: !1,
        });
    }
    (String.prototype.toPersianLetter = function () {
        return L(this);
    }),
        (Number.prototype.toPersianLetter = function () {
            return L(parseFloat(this).toString());
        }),
        $('span[data-s="true"]').click(function (a) {
            C = !0;
            var t = $(this).attr("data-p");
            $("#target div >span[data-hmk=" + t + "]").addClass("risx2"),
                $("#target div >span[data-hmk=" + t + "]").removeClass("risx3"),
                $("#target div> span[data-hmk!=" + t + "]").removeClass("risx2"),
                $("#target div> span[data-hmk!=" + t + "]").addClass("risx3"),
                $("#target div> .TableHeader").removeClass("risx3"),
                $(".dspanel span[data-p=" + t + "]").toggleClass("schild2"),
                $(".dspanel span[data-p!=" + t + "]").removeClass("schild2");
            var e = $(this).attr("data-p"),
                n = $("#target div >span[data-hmk=" + e + "]"),
                s = $("div.seatarea"),
                r = $(n);

            $(".seatarea").animate({
                scrollLeft: $(".seatarea").scrollLeft() - 120,
            });
            s.animate({ scrollTop: r.offset().top - s.offset().top + s.scrollTop() }),
                $("html, body").animate({ scrollTop: $(".headone").offset().top });
        }),
        $('span[data-s="uallx"]').click(function (a) {
            var t = $(this).attr("data-p");
            $("#target div >span[data-hmk!=" + t + "]").removeClass("risx3"),
                $("#target div >span[data-p=" + t + "]").toggleClass("schild2"),
                $("#target div >span[data-p!=" + t + "]").removeClass("schild2"),
                M(v, g);
        }),
        (j = v),
        (w = g),


        $.ajax({
            type: "POST",
            url: "stage.aspx/mapPlan",
            data: JSON.stringify({ psans: j }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            cache: false,
            success: function (response) {
                if (response.d.success) {

                    mapDataCache = response.d.data;
                    console.log("Map data fetched and cached:", mapDataCache);
                }
            },
            error: function (xhr, status, error) {
                alert("خطا در دریافت داده‌ها: " + xhr.responseText);
            }
        });





        $.ajax({
            type: "POST",
            url: "stage.aspx/mysen",
            data: "{midx: '" + j + "',sidx:'" + w + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: "true",
            cache: "false",
            success: function (a) {
                var t = a.d;
                $("#smooth").append(t), M(v, g);
            },
            complete: function () {
                const targetElement = document.getElementById("target");
                const showplaceElement = document.querySelector(".showplace");
                const controlAreaElement = document.querySelector(".controlArea");
  
                function scaleTarget(scaleValue, originX, originY) {
                    targetElement.style.transform = `scale(${scaleValue})`;
                    targetElement.style.transformOrigin = `${originX}px ${originY}px`;
                }
  
                let currentScale = 1;
                let lastDistance = null;
                let isPinching = false;
  
                const showplaceWidth = showplaceElement.offsetWidth;
                if (showplaceWidth > 650) {
                    currentScale = 0.8;
                } else {
                    currentScale = 1;
                }
  
                scaleTarget(currentScale, targetElement.offsetWidth / 2, targetElement.offsetHeight / 2);
  
                function getDistance(touches) {
                    const dx = touches[0].clientX - touches[1].clientX;
                    const dy = touches[0].clientY - touches[1].clientY;
                    return Math.sqrt(dx * dx + dy * dy);
                }
  
                const zoomInButton = document.createElement("button");
                zoomInButton.innerHTML = '+';
                zoomInButton.className = "control-button";
                zoomInButton.disabled = currentScale >= 1; // Disable initially if scale is 1 or more
  
                const zoomOutButton = document.createElement("button");
                zoomOutButton.innerHTML = '-';
                zoomOutButton.className = "control-button";
  
                const updateButtonStates = () => {
                    zoomInButton.disabled = currentScale >= 1; // Disable if scale is 1 or more
                    zoomOutButton.disabled = currentScale <= 0.4; // Disable if scale is less than or equal to 0.4
                };
  
                zoomInButton.addEventListener("click", (e) => {
                    e.preventDefault()
                    if (currentScale < 1) {
                        currentScale += 0.1;
                        scaleTarget(currentScale, targetElement.offsetWidth / 2, targetElement.offsetHeight / 2);
                        updateButtonStates(); // Update button states after scaling
                    }
                });
  
                zoomOutButton.addEventListener("click", (e) => {
                      e.preventDefault()
                    if (currentScale > 0.4) {
                        currentScale -= 0.1;
                        scaleTarget(currentScale, targetElement.offsetWidth / 2, targetElement.offsetHeight / 2);
                        updateButtonStates(); // Update button states after scaling
                    }
                });
  
                targetElement.addEventListener("touchstart", (event) => {
                    if (event.touches.length === 2) {
                        lastDistance = getDistance(event.touches);
                        isPinching = true;
                        event.preventDefault();
                    }
                });
  
                targetElement.addEventListener("touchmove", (event) => {
                    if (event.touches.length === 2 && lastDistance !== null) {
                        const currentDistance = getDistance(event.touches);
                        const scaleChange = currentDistance / lastDistance;
                        currentScale *= scaleChange;
  
                        currentScale = Math.max(0.4, Math.min(currentScale, 1));
  
                        const midpointX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
                        const midpointY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
  
                        scaleTarget(currentScale, midpointX, midpointY);
                        lastDistance = currentDistance;
                        updateButtonStates(); // Update button states after scaling
                        event.preventDefault();
                    } else if (isPinching) {
                        event.preventDefault();
                    }
                });
  
                targetElement.addEventListener("touchend", (event) => {
                    if (event.touches.length < 2) {
                        lastDistance = null;
                        isPinching = false;
                    }
                });
  
                controlAreaElement.appendChild(zoomInButton);
                controlAreaElement.appendChild(zoomOutButton);
            }
  
                       
  
            ,
            error: function (a, t, e) {
                alert(a.responseText);
            },
        }),
        $(document).on("click", ".orgincell", function () {
            var a = jQuery(this).attr("data-id");
            jQuery(this);
            !(function (a) {
                (Arrtitle = []),
                    $('span[data-id="' + a + '"]').toggleClass("ris2"),
                    (Arrhm = []),
                    (Arrseat = []),
                    (much = 0);
                var t = $('span[data-id="' + a + '"]').attr("data-id");
                if ($('span[data-id="' + a + '"]').hasClass("ris2"))
                    Arrid.push(t),
                        (k.innerHTML = " (    سبد خرید  " + Arrid.length + " بلیت  ) ");
                else {
                    var e = t;
                    (Arrid = jQuery.grep(Arrid, function (a) {
                        return a != e;
                    })),
                        (k.innerHTML =
                            " (    سبد خرید  " +
                            Arrid.length +
                            " بلیت  ) ");
                }
                for (var n = 0; n < Arrid.length; n++)
                    (Arrtitle[n] =
                        " ردیف  " +
                        $('span[data-id="' + Arrid[n] + '"]').attr("data-Row") +
                        " صندلی  " +
                        $('span[data-id="' + Arrid[n] + '"]').attr("data-seat")),
                        (Arrhm[n] = $('span[data-id="' + Arrid[n] + '"]').attr("data-hm")),
                        (much += parseInt(Arrhm[n]));
                A = much; // Assuming 'much' is the base price

                // Initialize variables for the output
                var baseAmountStr = much.toString(); // Pure amount without tax
                var taxAmountStr = "0"; // Default tax amount
                var totalPriceStr = baseAmountStr; // Default total price

                if (taxis == 1) {
                    var taxRate = 10; // Tax rate of 10%
                    var taxAmount = (much * taxRate) / 100; // Calculate tax amount
                    var totalPrice = much + taxAmount; // Calculate total price

                    // Update the tax and total price strings
                    taxAmountStr = taxAmount.toString(); // Tax amount
                    totalPriceStr = totalPrice.toString(); // Total price
                }

                var htmlOutput = "<div> مبلغ " + y(baseAmountStr) + " ریال  </div>" + "<div>"
                // L(baseAmountStr) + " تومان  </div>"

                if (taxis == 1) {
                    htmlOutput += "<div>ارزش افزوده: " + y(taxAmountStr) + " ریال</div>" +
                        "<div>مبلغ کل: " + y(totalPriceStr) + " ریال</div>"
                    // "<div>" + L(totalPriceStr) + " تومان</div>";
                }

                // Display the amounts in HTML
                $("#HowMuch").html(htmlOutput);

                GChainOfTitle = Arrtitle;
                GChainOfSeat = Arrid;
                GChainOfHm = Arrhm;
                $("#mch").html(y(totalPriceStr));

                if (Arrtitle.length > 9) {
                    C = true;
                    $("#HowMuch").html(
                        '<i style="color:red" class="fas fa-exclamation-triangle"></i> سقف خرید 8 بلیت است'
                    );
                    M(v, g);
                    $(".ris2").removeClass("ris2");
                    Arrtitle = [];
                    Arrid = [];
                    Arrhm = [];
                    $(".Uform").hide();
                }
            })(a);

        }),
        $("#nextstage").click(function (i) {
            (m = !0),
                (u = 0),
                (e = $("input[data-id=CardName]").val()),
                (n = $("input[data-id=CardC]").val()),
                (s = $("input[data-id=CardM]").val()),
                (r = $("#ContentPlaceHolder1_HideMid").val()),
                (o = $("#ContentPlaceHolder1_HideSid").val()),
                (d = $("#ContentPlaceHolder1_HidAg").val()),
                (cardD = $("input[data-id=CardD]").val()),
                (l = $("#ContentPlaceHolder1_HidTermin").val()),
                M(v, g);
            for (var f = 0; f < Arrid.length; f++)
                for (var C = 0; C < TemPcLink.length; C++)
                    (a = TemPcLink[C]), (b = Arrid[f]), a == b && u++;
            if (u <= 0) {
                const a = e.replace(/[\u200B-\u200D\uFEFF]/g, "-");
                (y = GChainOfSeat),
                    (x = GChainOfTitle),
                    (A = GChainOfHm),
                    (k = a),
                    (j = n),
                    (w = s),
                    (S = r),
                    (H = o),
                    (P = d),
                    (D = cardD),
                    U(S, D),
                    T(),
                    $.ajax({
                        type: "POST",
                        url: "stage.aspx/setajax",
                        data:
                            "{chainofseat: '" +
                            y +
                            "',chaninofnote:'" +
                            x +
                            "',chainofprice:'" +
                            A +
                            "',name:'" +
                            k +
                            "',codenumber:'" +
                            j +
                            "',phone:'" +
                            w +
                            "',Mida:'" +
                            S +
                            "',sidg:'" +
                            H +
                            "',ag:'" +
                            P +
                            "',terminal:'" +
                            l +
                            "',carD:'" +
                            D +
                            "'}",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        async: "true",
                        cache: "false",
                        success: function (a) {
                            var e;
                            (l = JSON.stringify(a.d.mid)),
                                (c = JSON.stringify(a.d.amount)),
                                (h = a.d.rdirect),
                                (p = a.d.ResNum),
                                "erc" != a.d.erc && "ern" === a.d.ern && "erp" === a.d.erp &&
                                ($.notify("بروز خطا "),
                                    $(".fa-spin").hide(),
                                    $("#nextstage").css("pointer-events", "auto"),
                                    $('#payx span').text('سبد خرید 0 بلیت'),
                                    $("#HowMuch").html( '<br/>  صندلی را شخص دیگری زودتر رزرو کرد لطفا صندلی دیگری انتخاب کنید' ),
                                    M(v, g)),
                                "ern" != a.d.ern &&
                                ($.notify("نام کامل نیست"),
                                    $(".fa-spin").hide(),
                                    $("#nextstage").css("pointer-events", "auto"),
                                    M(v, g)),
                                "true" != t &&
                                ($.notify("کد تخفیف نامعتبراست"),
                                    $(".fa-spin").hide(),
                                    $("#nextstage").css("pointer-events", "auto"),
                                    $("input[data-id=CardD]").val(""),
                                    M(v, g)),
                                "erp" != a.d.erp &&
                                ($.notify("شماره همراه کامل نیست"),
                                    $(".fa-spin").hide(),
                                    $("#nextstage").css("pointer-events", "auto"),
                                    M(v, g)),
                                "exx" != a.d.xx2 &&
                                ($.notify("صندلی توسط دیگری رزرو شد"),
                                    $(".fa-spin").hide(),
                                    $("#nextstage").css("pointer-events", "auto"),
                                    $(".Uform").hide(),
                                    (Arrid = []),
                                    (Arrhm = []),
                                    (Arrseat = []),
                                    $('#payx span').text('سبد خرید 0 بلیت'),
                                    $("#HowMuch").html( '<br/>  صندلی را شخص دیگری زودتر رزرو کرد لطفا صندلی دیگری انتخاب کنید' ),

                                    M(v, g)),
                                "eip" != a.d.ipc &&
                                ($.notify(
                                    "تعداد درخواست غیر مجاز تا آزاد شدن صندلی ها صبر کنید"
                                ),
                                    $(".fa-spin").hide(),
                                    $("#nextstage").css("display", "none"),
                                    M(v, g)),
                                "erc" == a.d.erc &&
                                "ern" == a.d.ern &&
                                "erp" == a.d.erp &&
                                "exx" == a.d.xx2 &&
                                "eip" == a.d.ipc &&
                                "true" == t &&
                                ($.notify(" درحال انتقال به درگاه بانکی ، فیلتر شکن را خاموش کنید", "success"),
                                    (e = $(
                                        '<form style="display:none" action="' +
                                        a.d.url +
                                        '" method="post"><input type="text" name="MID" value="' +
                                        l +
                                        '" /><input type="text" name="ResNum" value="' +
                                        p +
                                        '" /><input type="text" name="amount" value="' +
                                        c +
                                        '" /><input type="text" name="CellNumber" value="' +
                                        s +
                                        '" /><input type="text" name="ResNum1" value="' +
                                        r +
                                      '" /><input type="text" name="ResNum2" value="' +
                                        g +
                                         '" /><input type="text" name="ResNum3" value="' +
                                        Arrid +
                                     
                                     
                                     
                                        '" /><input type="text" name="RedirectURL" value="' +
                                        h +



                                        '" /></form>'
                                    )),
                                   console.log(e)
                                    
                                );
                        },
                        error: function (a) {
                            $(".orgincell").removeClass("ris2"),
                                $("#HowMuch").html("انتخاب این صندلی ها مقدور نیست");
                        },
                    });
            } else $.notify("صندلی توسط شخص دیگری رزرو شد"), $(".ris2").removeClass("ris2"), (Arrtitle = []), (Arrid = []), (Arrhm = []), M(v, g), $("input[data-id=CardD]").val(""), $("#nextstage").css("pointer-events", "auto");
            var y, x, A, k, j, w, S, H, P, D;
        }),
        $("#payx").click(function () {
            O() > 1 && parseInt($(".TableHeader").length / 2) > 10
                ? ($("#HowMuch").html(
                    '<i style="color:red;" class="fas fa-chair"> </i> <i class="fas fa-chair"></i> <i style="color:red" class="fas fa-chair"></i>  <br/>  لطفا صندلی تکی ایجاد نکنید'
                ),
                    $(".Uform").hide())
                : ($(".Uform").show(), $("#UserForm").css("margin-top", "50px")),
                A <= 0
                    ? ($("#HowMuch").html(
                        '<i Style="color:red" class="fas fa-exclamation-triangle"></i> انتخاب حداقل یک صندلی الزامی است'
                    ),
                        $(".Uform").hide())
                    : O() < 1 &&
                    ($(".Uform").show(), $("#UserForm").css("margin-top", "50px"));
        }),
        $(".menu-tab").click(function () {
            $(".nav1").css("z-index", "1"), $(".modal").css("z-index", "0");
        }),
        $("#paycl").click(function () {
            jQuery("html").css("overflow", "auto");
        }),
        $('input[data-id="CardC"]').keyup(function () {
            !(function (a) {
                if (!/^\d{10}$/.test(a)) return !1;
                var t,
                    e = parseInt(a[9]),
                    n = 0;
                for (t = 0; t < 9; ++t) n += parseInt(a[t]) * (10 - t);
                return ((n %= 11) < 2 && e == n) || (n >= 2 && e + n == 11);
            })($('input[data-id="CardC"]').val())
                ? ($('input[data-id="CardC"]').removeClass("h1y"),
                    $('input[data-id="CardC"]').addClass("h1E"),
                    $('input[data-id="CardC"]').attr("maxlength", "10"))
                : ($('input[data-id="CardC"]').css("bacground-color", "#00A591"),
                    $('input[data-id="CardC"]').addClass("h1y"),
                    $('input[data-id="CardC"]').removeClass("h1E"),
                    $('input[data-id="CardC"]').attr("maxlength", "10"),
                    $('input[data-id="CardM"]').focus());
        }),
        (S = v),
        $.ajax({
            type: "POST",
            url: "stage.aspx/discount",
            data: "{mid: '" + S + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: "true",
            cache: "false",
            success: function (a) {
                a.d.AllSeat, $("#diss").html(a.d);

                function getParameterByName(name, url = window.location.href) {
                    name = name.replace(/[\[\]]/g, "\\$&");
                    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                        results = regex.exec(url);
                    if (!results) return null;
                    if (!results[2]) return "";
                    return decodeURIComponent(results[2].replace(/\+/g, " "));
                }

                var fldis = getParameterByName("dc");
                if (fldis != null) {
                    $("input[data-id='CardD'").val(fldis);
                    $.notify("تخفیف شمادردرگاه بانکی اعمال میشود", "success");
                }
            },
            complete: function () { },
            error: function (a, t, e) { },
        }),
        $(document).on("click", "#nextdiscount", function () {
            f = !1;
            var a = $("input[data-id=CardD]").val();
            I(v, a),
                U(v, a),
                $("#nextstage").css("pointer-events", "auto"),
                "true" != t
                    ? $("input[data-id=CardD]").val("")
                    : $.notify("کدتخفیف  تایید شد", "success");
        }),
        $(document).on("keyup", "input[data-id=CardD]", function () {
            if (8 == $("input[data-id=CardD]").val().length) {
                f = !1;
                var a = $("input[data-id=CardD]").val();
                I(v, a),
                    U(v, a),
                    $("#nextstage").css("pointer-events", "auto"),
                    "true" != t
                        ? ($("input[data-id=CardD]").val(""),
                            $.notify("کدتخفیف اشتباه است"))
                        : $.notify("کدتخفیف تایید شد", "success");
            }
            $("input[data-id=CardD]").val().length > 8 &&
                $("input[data-id=CardD]").val(function (a, t) {
                    return t.substr(0, t.length - 1);
                });
        });
});
