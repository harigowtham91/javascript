
Cypress.Commands.add('getAllStorage', () => {
	cy.window().then((win) => {
		// Get all localStorage data
		const allLocalStorage = {}
		const allSessionStorage = {}

		// Function to get storage data for a specific origin
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

						allLocalStorage[origin] = localStorageData
						allSessionStorage[origin] = sessionStorageData

						document.body.removeChild(iframe)
						resolve()
					} catch (e) {
						cy.log(`Could not access storage for ${origin}:`, e)
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

		// Get storage data for each origin
		Promise.all(origins.map((origin) => getStorageForOrigin(origin))).then(() => {
			// Store in Cypress.env
			Cypress.env('allLocalStorage', allLocalStorage)
			Cypress.env('allSessionStorage', allSessionStorage)

			cy.log('All LocalStorage:', allLocalStorage)
			cy.log('All SessionStorage:', allSessionStorage)
		})
	})
})

Cypress.Commands.add('restoreAllStorage', () => {
	cy.window().then((win) => {
		const allLocalStorage = Cypress.env('allLocalStorage')
		const allSessionStorage = Cypress.env('allSessionStorage')

		// Function to restore storage for a specific origin
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

						document.body.removeChild(iframe)
						resolve()
					} catch (e) {
						cy.log(`Could not restore storage for ${origin}:`, e)
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

		// Restore storage for each origin
		Promise.all(origins.map((origin) => restoreStorageForOrigin(origin)))
	})
})
