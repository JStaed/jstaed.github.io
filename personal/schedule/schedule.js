const H = 48, S = 360, E = 1350;
    const ev = (start, end, label, category) => ({ start, end, label, category });
    const m = s => { const [a, b] = s.split(":"); return +a * 60 + +b };
    const fmt = s => { let [a, b] = s.split(":"); a = +a; const p = a >= 12 ? "pm" : "am"; a = a % 12 || 12; return a + (b === "00" ? "" : ":" + b) + p };

    const weekdayBase = [
      ev("8:00", "9:00", "Morning routine", "base"),
      ev("9:00", "9:45", "Starbucks", "meal"),
      ev("10:00", "10:50", "Python", "class"),
      ev("12:00", "13:50", "Work / LTS", "job")
    ];

    const monWed = [
      ...weekdayBase,
      ev("15:00", "17:30", "Metalsmithing", "class"),
      ev("17:30", "18:30", "Dinner", "meal")
    ];

    const wed = [
      ...monWed,
      ev("19:00", "21:00", "Metals Studio", "studio")
    ];

    const fri = [
      ...weekdayBase,
      ev("14:00", "15:00", "Therapy", "appt"),
      ev("16:30", "17:30", "COGS", "club"),
      ev("17:30", "18:30", "Dinner", "meal")
    ];

    const tue = [
      ev("7:00", "8:00", "Morning routine", "base"),
      ev("8:15", "10:45", "Wood Furniture", "class"),
      ev("11:00", "12:30", "LTS", "job"),
      ev("12:30", "13:45", "Work / LTS", "job"),
      ev("17:30", "18:30", "Dinner", "meal")
    ];

    const th = [
      ev("7:00", "8:00", "Morning routine", "base"),
      ev("8:15", "10:45", "Wood Furniture", "class"),
      ev("11:00", "12:30", "LTS", "job"),
      ev("12:30", "13:45", "Work / LTS", "job"),
      ev("14:00", "15:00", "Therapy", "appt"),
      ev("17:30", "18:30", "Dinner", "meal")
    ];

    const sat = [
      ev("8:00", "9:00", "Morning routine", "base"),
      ev("10:00", "11:00", "Starbucks", "meal"),
      ev("15:00", "17:00", "Metals Studio", "studio"),
      ev("17:30", "18:30", "Dinner", "meal"),
      ev("19:00", "21:00", "Metals Studio", "studio")
    ];

    const sun = [
      ev("8:00", "9:00", "Morning routine", "base"),
      ev("10:00", "11:30", "Brunch", "meal"),
      ev("17:30", "18:30", "Dinner", "meal")
    ];

    const schedule = { Sun: sun, Mon: monWed, Tue: tue, Wed: wed, Thu: th, Fri: fri, Sat: sat };
    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = dayOrder.map(day => [day, schedule[day]]);
    const cats = { class: "Classes", job: "Work", meal: "Starbucks", meal: "Meals", flex: "Flex / homework", free: "Free time", base: "Routine", club: "Club", appt: "Appointments", studio: "Studio time" };
    const dayLabels = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
    const easternNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    const currentDay = dayOrder[easternNow.getDay()];
    const currentIndex = dayOrder.indexOf(currentDay);

    const workEntries = Object.values(schedule)
      .flat()
      .filter(event => event.category === "job");
    
    const ltsEntries = Object.values(schedule)
      .flat()
      .filter(event => event.label.includes("LTS"));

    const workMinutes = workEntries.reduce((total, event) => total + (m(event.end) - m(event.start)), 0);
    const ltsMinutes = 30 + ltsEntries.reduce((total, event) => total + (m(event.end) - m(event.start)), 0);
    // const pay = ((workMinutes / 60) * 125 * 0.7) + (((ltsMinutes) / 60) * 11 * 0.95);
    const hoursText = minutes => (minutes / 60).toFixed(1).replace(/\.0$/, "");
    const summary = document.getElementById("scheduleSummary");
    summary.textContent = `Wake 7:00am · Bed 11:00pm · Work ${hoursText(workMinutes)} Hours · ${hoursText(ltsMinutes)} LTS Hours`;

    document.getElementById("legend").innerHTML = Object.entries(cats).filter(([k]) => !["flex", "free"].includes(k)).map(([k, v]) => `<span class="chip" style="background:var(--${k}-bg);border-color:var(--${k}-bd);color:var(--${k}-fg)">${v}</span>`).join("");

    const mobileDays = document.getElementById("mobileDays");
    const mobileDayView = document.getElementById("mobileDayView");
    const mobileDayHeading = document.getElementById("mobileDayHeading");
    const mobileEventCount = document.getElementById("mobileEventCount");
    const mobileEvents = document.getElementById("mobileEvents");
    mobileDays.innerHTML = days.map(([day], index) => `<button type="button" role="tab" id="mobile-day-${index}" class="${day === currentDay ? 'is-current' : ''}" aria-controls="mobileDayView" aria-label="${dayLabels[day]}" aria-selected="false" tabindex="-1">${day}</button>`).join("");
    const mobileDayTabs = Array.from(mobileDays.querySelectorAll('[role="tab"]'));

    function ShowMobileDay(index, moveFocus = false) {
      const [day, events] = days[index];
      const visibleEvents = events.filter(event => !["flex", "free"].includes(event.category));
      mobileDayTabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.classList.toggle("is-current", dayOrder[tabIndex] === currentDay);
        tab.tabIndex = selected ? 0 : -1;
      });
      mobileDayView.setAttribute("aria-labelledby", mobileDayTabs[index].id);
      mobileDayHeading.textContent = dayLabels[day];
      mobileEventCount.textContent = `${visibleEvents.length} scheduled events`;
      mobileEvents.innerHTML = visibleEvents.map(({ start, end, label, category }) => `<article class="mobile-event" style="--event-bg:var(--${category}-bg);--event-border:var(--${category}-bd);--event-fg:var(--${category}-fg)"><span class="mobile-event-time">${fmt(start)}&ndash;${fmt(end)}</span><span><strong class="mobile-event-name">${label}</strong><span class="mobile-event-category">${cats[category]}</span></span></article>`).join("");
      if (moveFocus) mobileDayTabs[index].focus();
    }

    mobileDayTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => ShowMobileDay(index));
      tab.addEventListener("keydown", event => {
        let nextIndex;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % days.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + days.length) % days.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = days.length - 1;
        if (nextIndex !== undefined) {
          event.preventDefault();
          ShowMobileDay(nextIndex, true);
        }
      });
    });
    ShowMobileDay(currentIndex);

    const total = (E - S) / 60 * H;
    let h = '<div class="hd"></div>' + days.map(d => `<div class="hd ${d[0] === currentDay ? 'is-current' : ''}">${d[0]}</div>`).join("");
    let t = '<div class="times" style="height:' + total + 'px">';
    for (let x = 6; x <= 22; x++) { t += `<span style="top:${(x - 6) * H}px">${fmt(x + ":00")}</span>` }
    h += t + "</div>";
    days.forEach(([day, evs]) => {
      h += `<div class="col" style="height:${total}px">` + evs.filter(event => !["flex", "free"].includes(event.category)).map(({ start, end, label, category }) => {
        const top = (m(start) - S) / 60 * H, ht = (m(end) - m(start)) / 60 * H;
        return `<div class="ev" style="top:${top}px;height:${ht - 2}px;background:var(--${category}-bg);border-color:var(--${category}-bd);color:var(--${category}-fg)"><b>${label}</b><i>${fmt(start)}&ndash;${fmt(end)}</i></div>`
      }).join("") + "</div>";
    });
    document.getElementById("grid").innerHTML = h;
