document.addEventListener("DOMContentLoaded", function () {
  const resultEl = document.getElementById("result");
  const historyEl = document.getElementById("history");
  const copyBtn = document.getElementById("copy-btn");
  const themeToggle = document.getElementById("theme-toggle");

  let expression = "";

  function formatNumber(num) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 10,
    }).format(num);
  }

  function updateDisplay() {
    resultEl.value = expression;
  }

  function isOperator(char) {
    return ['+', '-', '*', '/', '.'].includes(char);
  }

  function isInvalidSequence(value) {
    const lastChar = expression.slice(-1);

    // Prevent double operators (e.g., ++, --, **, //)
    if (isOperator(value) && isOperator(lastChar)) {
      return true;
    }

    // Prevent closing parenthesis after an operator (e.g., +), sin), etc.
    if (value === ')' && isOperator(lastChar)) {
      return true;
    }

    // Prevent open parenthesis after a number without an operator (e.g., 5( )
    if (value === '(' && /\d$/.test(expression)) {
      return true;
    }

    // Prevent function like sin) without a number
    if (['sin', 'cos', 'tan', 'log', 'sqrt', 'exp'].includes(value) && expression.endsWith(')')) {
      return true;
    }

    return false;
  }

  document.querySelectorAll(".buttons button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.value;
      const action = btn.dataset.action;
      const func = btn.dataset.func;

      handleInput({ value, action, func });
    });
  });

  function handleInput({ value, action, func }) {
    if (value !== undefined) {
      if (!isInvalidSequence(value)) {
        expression += value;
      }
    } else if (action === "clear") {
      expression = "";
    } else if (action === "delete") {
      expression = expression.slice(0, -1);
    } else if (action === "equal") {
      try {
        const rawResult = eval(expression);
        const formatted = formatNumber(rawResult);
        historyEl.innerText = `${expression} =`;
        expression = rawResult.toString();
        resultEl.value = formatted;
        return;
      } catch {
        expression = "";
        resultEl.value = "Error";
        return;
      }
    } else if (func) {
      try {
        let lastNumber = expression.match(/(\d+\.?\d*)$/);
        if (!lastNumber) return;
        let num = parseFloat(lastNumber[0]);
        let result;
        switch (func) {
          case "sqrt": result = Math.sqrt(num); break;
          case "sin": result = Math.sin(num * (Math.PI / 180)); break;
          case "cos": result = Math.cos(num * (Math.PI / 180)); break;
          case "tan": result = Math.tan(num * (Math.PI / 180)); break;
          case "log": result = Math.log10(num); break;
          case "exp": result = Math.exp(num); break;
        }
        expression = expression.replace(/(\d+\.?\d*)$/, result.toString());
      } catch {
        expression = "";
        resultEl.value = "Error";
        return;
      }
    }
    updateDisplay();
  }

  // Dark Mode Toggle
  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("light-mode");
  });

  // Copy Result
  copyBtn.addEventListener("click", () => {
    const result = resultEl.value;
    navigator.clipboard.writeText(result).then(() => {
      alert("Result copied to clipboard!");
    });
  });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    const validKeys = "0123456789+-*/().";
    let handled = false;

    if (validKeys.includes(key)) {
      if (!isInvalidSequence(key)) {
        expression += key;
        handled = true;
      }
    } else if (key === "Enter" || key === "=") {
      handleInput({ action: "equal" });
      handled = true;
    } else if (key === "Backspace") {
      handleInput({ action: "delete" });
      handled = true;
    } else if (key.toLowerCase() === "c") {
      handleInput({ action: "clear" });
      handled = true;
    }

    const lastNumberMatch = expression.match(/(\d+\.?\d*)$/);
    const lastNumber = lastNumberMatch ? parseFloat(lastNumberMatch[0]) : null;
    if (lastNumber !== null) {
      let result = null;
      switch (key.toLowerCase()) {
        case "s": result = Math.sin(lastNumber * (Math.PI / 180)); break;
        case "o": result = Math.cos(lastNumber * (Math.PI / 180)); break;
        case "t": result = Math.tan(lastNumber * (Math.PI / 180)); break;
        case "l": result = Math.log10(lastNumber); break;
        case "r": result = Math.sqrt(lastNumber); break;
        case "e": result = Math.exp(lastNumber); break;
      }
      if (result !== null) {
        expression = expression.replace(/(\d+\.?\d*)$/, result.toString());
        handled = true;
      }
    }

    if (handled) {
      updateDisplay();
    }

    highlightButtonByKey(key);
  });

  function highlightButtonByKey(key) {
    let selector;

    if ("0123456789".includes(key)) {
      selector = `[data-value="${key}"]`;
    } else if (["+", "-", "*", "/", "."].includes(key)) {
      selector = `[data-value="${key}"]`;
    } else if (key === "Enter" || key === "=") {
      selector = `[data-action="equal"]`;
    } else if (key === "Backspace") {
      selector = `[data-action="delete"]`;
    } else if (key.toLowerCase() === "c") {
      selector = `[data-action="clear"]`;
    } else if (key.toLowerCase() === "s") {
      selector = `[data-func="sin"]`;
    } else if (key.toLowerCase() === "o") {
      selector = `[data-func="cos"]`;
    } else if (key.toLowerCase() === "t") {
      selector = `[data-func="tan"]`;
    } else if (key.toLowerCase() === "l") {
      selector = `[data-func="log"]`;
    } else if (key.toLowerCase() === "r") {
      selector = `[data-func="sqrt"]`;
    } else if (key.toLowerCase() === "e") {
      selector = `[data-func="exp"]`;
    }

    if (selector) {
      const button = document.querySelector(selector);
      if (button) {
        button.classList.add("active");
        setTimeout(() => button.classList.remove("active"), 150);
      }
    }
  }
});
