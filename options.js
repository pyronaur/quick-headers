const handle_toggle = e => {
	if (!e.target || !e.target.classList.contains("action--toggle")) {
		return false;
	}

	let key = e.target.closest(".custom-header").querySelector(".key");
	if (!key) {
		return false;
	}

	toggle_header(key.innerText);
	return true;
};

const handle_delete = e => {
	if (!e.target || !e.target.classList.contains("action--delete")) {
		return false;
	}

	let key = e.target.closest(".custom-header").querySelector(".key");
	if (!key) {
		return false;
	}
	delete_header(key.innerText);
	return true;
};

const init = () => {
	const headers = get("headers");
	const enabled_headers = get_enabled_headers();

	let list = document.querySelector(".custom-header-list");

	if (Object.entries(headers).length > 0) {
		document
			.querySelector(".custom-header-list")
			.classList.remove("is-hidden");
	}

	Object.entries(headers).forEach(entry => {
		const key = entry[0];
		const value = entry[1];
		const is_enabled = enabled_headers && enabled_headers.includes(key);

		let action_label = "enable";
		let status_label = "Disabled";
		let status_html_class = "is-disabled";

		if (is_enabled) {
			action_label = "disable";
			status_label = "Enabled";
			status_html_class = "is-enabled";
		}

		const html = `
    <div class="custom-header">
      <div class="key">${key}</div>
      <code class="value">${value}</code>
      <div class="status"><span class="${status_html_class}">${status_label}</span></div>
      <div class="toggle"><div class="action--toggle button button--action">${action_label}</div></div>
      <div class="delete"><div class="action--delete button button--danger">Delete</div></div>
    </div>
    `;

		var range = document.createRange();

		range.selectNode(document.getElementsByTagName("div").item(0));
		var documentFragment = range.createContextualFragment(html);
		list.appendChild(documentFragment);
	});

	document.addEventListener("click", e => {
		if (handle_toggle(e) || handle_delete(e)) {
			location.reload();
		}
	});

	document.querySelector(".add-new__form").addEventListener("submit", e => {
		let form = document.querySelector(".add-new__form");
		if (!form) {
			return false;
		}

		let key = form.querySelector("input[name=key]").value;
		let value = form.querySelector("input[name=value]").value;
		add_header(key, value);
    e.preventDefault()
    location.reload()
	});
};

cache_options().then( init );
