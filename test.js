Cypress.Commands.add('getAllStorage', () => {
	cy.window().then((win) => {
		// Get all storage data
		const allLocalStorage = {}
		const allSessionStorage = {}
		const allCookies = {}

		// Function to get storage and cookies for a specific origin
		const getStorageForOrigin = (origin) => {
			return new Promise((resolve) => {
				// Create an iframe to access the origin's storage
				const iframe = document.createElement('iframe')
				iframe.src = origin
				iframe.style.display = 'none'
				document.body.appendChild(iframe)

				iframe.onload = () => {
					try {
						const localStorageData = {}
						const sessionStorageData = {}
						const cookiesData = {}

						// Get localStorage
						for (let i = 0; i < iframe.contentWindow.localStorage.length; i++) {
							const key = iframe.contentWindow.localStorage.key(i)
							localStorageData[key] = iframe.contentWindow.localStorage.getItem(key)
						}

						// Get sessionStorage
						for (let i = 0; i < iframe.contentWindow.sessionStorage.length; i++) {
							const key = iframe.contentWindow.sessionStorage.key(i)
							sessionStorageData[key] = iframe.contentWindow.sessionStorage.getItem(key)
						}

						// Get cookies
						const cookies = document.cookie.split(';')
						cookies.forEach((cookie) => {
							const [name, value] = cookie.trim().split('=')
							cookiesData[name] = value
						})

						allLocalStorage[origin] = localStorageData
						allSessionStorage[origin] = sessionStorageData
						allCookies[origin] = cookiesData

						document.body.removeChild(iframe)
						resolve()
					} catch (e) {
						cy.log(`Could not access storage/cookies for ${origin}:`, e)
						document.body.removeChild(iframe)
						resolve()
					}
				}
			})
		}

		// List of origins to check (you can modify this list based on your needs)
		const origins = [
			win.location.origin,
			'https://api.example.com',
			'https://auth.example.com',
			'https://cdn.example.com',
			// Add more origins as needed
		]

		// Get storage and cookies for each origin
		Promise.all(origins.map((origin) => getStorageForOrigin(origin))).then(() => {
			// Store in Cypress.env
			Cypress.env('allLocalStorage', allLocalStorage)
			Cypress.env('allSessionStorage', allSessionStorage)
			Cypress.env('allCookies', allCookies)

			cy.log('All LocalStorage:', allLocalStorage)
			cy.log('All SessionStorage:', allSessionStorage)
			cy.log('All Cookies:', allCookies)
		})
	})
})

Cypress.Commands.add('restoreAllStorage', () => {
	cy.window().then((win) => {
		const allLocalStorage = Cypress.env('allLocalStorage')
		const allSessionStorage = Cypress.env('allSessionStorage')
		const allCookies = Cypress.env('allCookies')

		// Function to restore storage and cookies for a specific origin
		const restoreStorageForOrigin = (origin) => {
			return new Promise((resolve) => {
				const iframe = document.createElement('iframe')
				iframe.src = origin
				iframe.style.display = 'none'
				document.body.appendChild(iframe)

				iframe.onload = () => {
					try {
						// Restore localStorage
						if (allLocalStorage && allLocalStorage[origin]) {
							iframe.contentWindow.localStorage.clear()
							Object.entries(allLocalStorage[origin]).forEach(([key, value]) => {
								iframe.contentWindow.localStorage.setItem(key, value)
							})
						}

						// Restore sessionStorage
						if (allSessionStorage && allSessionStorage[origin]) {
							iframe.contentWindow.sessionStorage.clear()
							Object.entries(allSessionStorage[origin]).forEach(([key, value]) => {
								iframe.contentWindow.sessionStorage.setItem(key, value)
							})
						}

						// Restore cookies
						if (allCookies && allCookies[origin]) {
							// Clear existing cookies for this origin
							const cookies = document.cookie.split(';')
							cookies.forEach((cookie) => {
								const [name] = cookie.trim().split('=')
								document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${new URL(origin).hostname}`
							})

							// Set new cookies
							Object.entries(allCookies[origin]).forEach(([name, value]) => {
								document.cookie = `${name}=${value}; path=/; domain=${new URL(origin).hostname}`
							})
						}

						document.body.removeChild(iframe)
						resolve()
					} catch (e) {
						cy.log(`Could not restore storage/cookies for ${origin}:`, e)
						document.body.removeChild(iframe)
						resolve()
					}
				}
			})
		}

		// List of origins to restore
		const origins = [
			win.location.origin,
			'https://api.example.com',
			'https://auth.example.com',
			'https://cdn.example.com',
			// Add more origins as needed
		]

		// Restore storage and cookies for each origin
		Promise.all(origins.map((origin) => restoreStorageForOrigin(origin)))
	})
})
