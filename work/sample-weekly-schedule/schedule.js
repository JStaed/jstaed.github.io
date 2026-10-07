const H = 48, S = 360, E = 1350;
    const ev = (start, end, label, category) => ({ start, end, label, category });
    const m = s => { const [a, b] = s.split(":"); return +a * 60 + +b };
    const fmt = s => { let [a, b] = s.split(":"); a = +a; const p = a >= 12 ? "pm" : "am"; a = a % 12 || 12; return a + (b === "00" ? "" : ":" + b) + p };

    const mon = [
      ev("7:30", "8:00", "Get ready", "base"),
      ev("8:00", "8:30", "Breakfast", "meal"),
      ev("9:00", "10:15", "Biology lecture", "class"),
      ev("10:30", "11:45", "College writing", "class"),
      ev("12:00", "13:00", "Lunch", "meal"),
      ev("13:00", "14:00", "Library study", "class"),
      ev("14:00", "16:00", "Campus job", "job"),
      ev("16:30", "17:30", "Gym", "studio"),
      ev("18:00", "19:00", "Dinner", "meal"),
      ev("19:00", "21:00", "Homework", "class")
    ];

    const tue = [
      ev("7:30", "8:00", "Get ready", "base"),
      ev("8:00", "8:30", "Breakfast", "meal"),
      ev("9:30", "10:45", "Calculus", "class"),
      ev("11:00", "12:15", "Psychology", "class"),
      ev("12:15", "13:15", "Lunch", "meal"),
      ev("13:30", "15:30", "Biology lab", "class"),
      ev("16:00", "17:00", "Study group", "class"),
      ev("18:00", "19:00", "Dinner", "meal"),
      ev("19:00", "20:30", "Student club meeting", "club")
    ];

    const wed = [
      ev("7:30", "8:00", "Get ready", "base"),
      ev("8:00", "8:30", "Breakfast", "meal"),
      ev("9:00", "10:15", "Biology lecture", "class"),
      ev("10:30", "11:45", "College writing", "class"),
      ev("12:00", "13:00", "Lunch", "meal"),
      ev("13:00", "14:00", "Professor office hours", "class"),
      ev("14:00", "16:00", "Campus job", "job"),
      ev("16:30", "17:30", "Gym", "studio"),
      ev("18:00", "19:00", "Dinner", "meal"),
      ev("19:00", "21:00", "Homework", "class")
    ];

    const th = [
      ev("7:30", "8:00", "Get ready", "base"),
      ev("8:00", "8:30", "Breakfast", "meal"),
      ev("9:30", "10:45", "Calculus", "class"),
      ev("11:00", "12:15", "Economics", "class"),
      ev("12:15", "13:15", "Lunch", "meal"),
      ev("13:30", "15:30", "Biology lab", "class"),
      ev("16:00", "17:00", "Library study", "class"),
      ev("18:00", "19:00", "Dinner", "meal"),
      ev("19:00", "20:30", "Intramural sports", "club")
    ];

    const fri = [
      ev("7:30", "8:00", "Get ready", "base"),
      ev("8:00", "8:30", "Breakfast", "meal"),
      ev("9:00", "10:15", "Biology lecture", "class"),
      ev("10:30", "11:45", "College writing", "class"),
      ev("12:00", "13:00", "Lunch with friends", "meal"),
      ev("13:00", "15:00", "Finish assignments", "class"),
      ev("15:30", "17:30", "Campus job", "job"),
      ev("18:00", "19:00", "Dinner", "meal"),
      ev("19:00", "21:00", "Movie night", "club")
    ];

    const sat = [
      ev("9:00", "9:30", "Wake up", "base"),
      ev("9:30", "10:00", "Breakfast", "meal"),
      ev("10:30", "12:00", "Grocery shopping", "base"),
      ev("12:00", "13:00", "Lunch", "meal"),
      ev("13:00", "15:00", "Laundry and chores", "base"),
      ev("15:30", "17:00", "Free time", "studio"),
      ev("18:00", "19:00", "Dinner", "meal"),
      ev("19:00", "21:30", "Hang out with friends", "club")
    ];

    const sun = [
      ev("9:00", "9:30", "Wake up", "base"),
      ev("9:30", "10:00", "Breakfast", "meal"),
      ev("10:00", "12:00", "Weekly reading and homework", "class"),
      ev("12:00", "13:00", "Lunch", "meal"),
      ev("13:00", "14:30", "Laundry", "base"),
      ev("15:00", "16:00", "Meal prep", "base"),
      ev("16:00", "17:00", "Plan the week", "base"),
      ev("18:00", "19:00", "Dinner", "meal"),
      ev("19:00", "20:30", "Review notes", "class")
    ];

    const schedule = { Sun: sun, Mon: mon, Tue: tue, Wed: wed, Thu: th, Fri: fri, Sat: sat };
    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = dayOrder.map(day => [day, schedule[day]]);
    const cats = { class: "Classes & study", job: "Campus job", meal: "Meals", base: "Daily routine", club: "Campus life", studio: "Exercise & free time" };
    const dayLabels = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
    const currentDay = dayOrder[new Date().getDay()];
    const currentIndex = dayOrder.indexOf(currentDay);

    const summary = document.getElementById("scheduleSummary");
    summary.textContent = "A sample college week with classes, study time, campus activities, work, and downtime.";

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
