function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};

const log = message => {
	if (!chrome.tabs) {
		console.log(message)
		return false
	}

	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        
        if( typeof message === 'object' ) {
            message = simpleStringify(message)
        }
        
        chrome.tabs.executeScript(tabs[0].id, {
			code: `console.log('${message}');`
		})
	})
}

let cached_chrome_storage = {};
const cache_options = () => {

    return new Promise((resolve) => {

        if (chrome.storage && chrome.storage.local) {

            const update_storage_cache = () => {
                chrome.storage.local.get(null, data => {
                    if (!data || data == {}) {
                        return
                    }
                    cached_chrome_storage = data
                    resolve(data)
                })
            }
            chrome.storage.onChanged.addListener(update_storage_cache)
            update_storage_cache()
        }

        else {
            resolve()
        }

    }

    );

}



const set = (key, value) => {
    if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set( { [key]: value })
    } else {
        localStorage.setItem(key, JSON.stringify(value))
    }
}




const get = key => {
	if (chrome.storage && chrome.storage.local) {
		if (cached_chrome_storage[key]) {
            return cached_chrome_storage[key]
		} else {
			return false
		}
	} else {
		return (value = localStorage.getItem(key)) ? JSON.parse(value) : {}
	}
}

const add_header = (key, value) => {
    let headers = get("headers")
    
    if( ! headers ) {
        headers = {}
    }

	headers[key] = value
	return set("headers", headers)
}

const delete_header = key => {
	let headers = get("headers")

	delete headers[key]
	return set("headers", headers)
}

function url_to_hostname(url) {
	// Handle Chrome URLs
	if (/^chrome:\/\//.test(url)) {
		return
	}
	try {
		var newUrl = new URL(url)
		return newUrl.hostname
	} catch (err) {}
}

const get_host = () => {
	let host = location.host
	// For Development, when host is empty:
	if (!host) {
		host = location.href
	}

	// Chrome
    if (chrome && chrome.extension) {
        let global = chrome.extension.getBackgroundPage()
		host = global.cached_hostname || ""
	}

	return host.replace(/[^\w-]/gi, "")
}

const get_enabled_headers = () => {
	const sites = get("sites") || {}
	const host = get_host()

	if ( !sites[host]) {
		return false
	}

	return sites[host]
}

const toggle_header = key => {
	const host = get_host()
	const sites = get("sites") || {}
    let enabled_keys = []
    if (sites[host]) {
		enabled_keys = sites[host]
	}

	if (enabled_keys.includes(key)) {
		enabled_keys.splice(enabled_keys.indexOf(key), 1)
	} else {
		enabled_keys.push(key)
	}

	sites[host] = enabled_keys
	return set("sites", sites)
}
