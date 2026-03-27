
const programForm = document.getElementById("programForm");
const contactForm = document.getElementById("contactForm");

const dropdownContainers = document.querySelectorAll(".custom-dropdown-container");

dropdownContainers.forEach(container => {
  const dropdownHeader = container.querySelector(".dropdown-header");
  const dropdownList = container.querySelector(".dropdown-list");
  const dropdownTitle = container.querySelector(".dropdown-title");
  const checkboxes = container.querySelectorAll(".custom-checkbox");
  const defaultText = container.getAttribute("data-placeholder") || "Select Options";

  if (dropdownHeader && dropdownList) {
    dropdownHeader.addEventListener("click", () => {
      const isShowing = dropdownList.classList.contains("show");
      
      // Close all dropdowns
      document.querySelectorAll(".dropdown-list").forEach(list => list.classList.remove("show"));
      document.querySelectorAll(".dropdown-header").forEach(header => header.classList.remove("active"));
      
      // If wasn't showing, show this one
      if (!isShowing) {
        dropdownList.classList.add("show");
        dropdownHeader.classList.add("active");
      }
    });

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const selected = Array.from(checkboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
          
        if (selected.length === 0) {
          dropdownTitle.textContent = defaultText;
        } else if (selected.length === 1) {
          dropdownTitle.textContent = selected[0];
        } else if (selected.length === checkboxes.length) {
          dropdownTitle.textContent = "All Selected";
        } else {
          dropdownTitle.textContent = `${selected.length} Selected`;
        }
        
        // Auto close if it's a single select radio
        if (checkbox.type === "radio") {
          dropdownList.classList.remove("show");
          dropdownHeader.classList.remove("active");
        }
      });
    });
  }
});

// Close when clicking outside
document.addEventListener("click", (e) => {
  dropdownContainers.forEach(container => {
    const header = container.querySelector(".dropdown-header");
    const list = container.querySelector(".dropdown-list");
    if (header && list && !header.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove("show");
      header.classList.remove("active");
    }
  });
});

if (programForm) {
  programForm.addEventListener("submit", (event) => {
    // event.preventDefault();
    const message = document.getElementById("formMessage");
    if (message) {
      message.textContent = "Your selections are ready. A learning advisor can guide you next.";
    }
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.getElementById("contactMessage");
    if (message) {
      message.textContent = "Message sent successfully. Our team will respond soon.";
    }
    contactForm.reset();
  });
}
