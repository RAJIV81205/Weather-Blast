document.getElementById('contactForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = document.getElementById('email');
      const msgBox = document.getElementById('msg');

      const emailValue = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

      if (!emailPattern.test(emailValue)) {
        msgBox.className = "msg-failed";
        msgBox.textContent = "Please enter a valid email address!!";
        return;
      }
      msgBox.className = "msg-success";
      msgBox.textContent = "Message sent successfully :)";

    });