/**
 * Cache the hostname
 */
window.cached_hostname = false

const cache_hostname = () => {

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
		tabs
	) {
		let host = url_to_hostname(tabs[0].url)
		if (host) {
			window.cached_hostname = host
		}
  })
  
}

cache_hostname()
chrome.tabs.onActivated.addListener(cache_hostname)
cache_options().then( () => {

/**
 * Set the headers when neccessary
 */
chrome.webRequest.onBeforeSendHeaders.addListener(
	details => {
    let enabled_headers = get_enabled_headers()
    
    if( ! enabled_headers || enabled_headers.length === 0) {
      return;
    }

    enabled_headers.forEach(header_name => {
      const header_value = get("headers")[header_name];
      if( ! header_value ) {
        return;
      }

      details.requestHeaders.push({ name: header_name, value: header_value })
    });
		
		return { requestHeaders: details.requestHeaders }
	},
	{ urls: ["<all_urls>"] },
	["blocking", "requestHeaders"]
)
});