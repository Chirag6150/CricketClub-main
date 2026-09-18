gsap.to("#nav", {
    backgroundColor: "#ffffff05",
    backdropFilter: "blur(5px)",
    height: "14vh",
    gap: "5vw",
    duration: 3,
    scrollTrigger: {
        trigger: "#nav",
        scroller: "body",
        start: "top -10%",
        end: "top -14%",
        scrub: 1
    }
});


gsap.to("#main", {
    backgroundColor: "#000",
    scrollTrigger: {
        trigger: "#main",
        scroller: "body",
        start: "top -24%",
        end: "top -70%",
        scrub: 2
    }
});

gsap.from("#about .abtImg, #abtText", {
    y: "10vh",
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: "#about",
        scroller: "body",
        start: "top 70%",
        end: "top 65%",
        scrub: 1
    }
});

gsap.from(".card", {
    scale: 0.8,
    duration: 0.3,
    scrollTrigger: {
        trigger: ".card",
        scroller: "body",
        start: "top 85%",
        end: "top 80%",
        scrub: 1
    }
});

gsap.to(".imgLeft", {
    opacity: 1,
    x: "15vw",
    scale: 1.5,
    delay: 2,
    scrollTrigger: {
        trigger: ".imgLeft",
        start: "top 70%",
        end: "top 80%",
        scrub: 9
    }
});

gsap.to(".imgRight", {
    opacity: 1,
    x: "-15vw",
    scale: 1.5,
    delay: 2,
    scrollTrigger: {
        trigger: ".imgRight",
        start: "top 70%",
        end: "top 80%",
        scrub: 9
    }
});

gsap.from("#signUpDiv h4", {
    scale: 0.8,
    duration: 0.4,
    scrollTrigger: {
        trigger: "#signUpDiv",
        start: "top 70%",
        end: "top 80%",
        scrub: 2
    }
});

gsap.to("#colon1", {
    y: "5vh",
    x: "5vw",
    scrollTrigger: {
        trigger: "#colon1",
        start: "top 55%",
        end: "top 45%",
        scrub: 4
    }
});

gsap.to("#colon2", {
    y: "-5vh",
    x: "-5vw",
    scrollTrigger: {
        trigger: "#colon1",
        start: "top 55%",
        end: "top 45%",
        scrub: 4
    }
});

gsap.to("#lustTxt", {
    y: "13vh",
    scrollTrigger: {
        trigger: "#lustTxt",
        start: "top bottom",
        end: "top 95%",
        scrub: 4
    }
});
