

Cypress.Commands.add('getAllStorage', () => {
	cy.window().then((win) => {
		// Get all localStorage data from all origins
		const allLocalStorage = {}
		try {
			// Try to access chrome.storage.local if available
			if (win.chrome && win.chrome.storage && win.chrome.storage.local) {
				win.chrome.storage.local.get(null, (items) => {
					allLocalStorage['chrome.storage.local'] = items
				})
			}
		} catch (e) {
			cy.log('Could not access chrome.storage.local:', e)
		}

		// Get current origin's localStorage
		const currentLocalStorage = {}
		for (let i = 0; i < win.localStorage.length; i++) {
			const key = win.localStorage.key(i)
			currentLocalStorage[key] = win.localStorage.getItem(key)
		}
		allLocalStorage[win.location.origin] = currentLocalStorage

		// Store in Cypress.env
		Cypress.env('allLocalStorage', allLocalStorage)
		cy.log('All LocalStorage:', allLocalStorage)

		// Get all sessionStorage data
		const allSessionStorage = {}
		const currentSessionStorage = {}
		for (let i = 0; i < win.sessionStorage.length; i++) {
			const key = win.sessionStorage.key(i)
			currentSessionStorage[key] = win.sessionStorage.getItem(key)
		}
		allSessionStorage[win.location.origin] = currentSessionStorage

		// Store in Cypress.env
		Cypress.env('allSessionStorage', allSessionStorage)
		cy.log('All SessionStorage:', allSessionStorage)
	})
})

Cypress.Commands.add('getSessionStorageForOrigin', (origin) => {
	cy.visit(origin).then(() => {
		cy.window().then((win) => {
			const sessionStorageData = {}
			for (let i = 0; i < win.sessionStorage.length; i++) {
				const key = win.sessionStorage.key(i)
				sessionStorageData[key] = win.sessionStorage.getItem(key)
			}

			// Update the allSessionStorage object
			const allSessionStorage = Cypress.env('allSessionStorage') || {}
			allSessionStorage[origin] = sessionStorageData
			Cypress.env('allSessionStorage', allSessionStorage)

			cy.log(`SessionStorage for ${origin}:`, sessionStorageData)
		})
	})
})

Cypress.Commands.add('restoreAllStorage', () => {
	cy.window().then((win) => {
		// Clear existing storage
		win.localStorage.clear()
		win.sessionStorage.clear()

		// Restore localStorage from all origins
		const allLocalStorage = Cypress.env('allLocalStorage')
		if (allLocalStorage) {
			// Restore current origin's localStorage
			const currentOriginStorage = allLocalStorage[win.location.origin]
			if (currentOriginStorage) {
				Object.entries(currentOriginStorage).forEach(([key, value]) => {
					win.localStorage.setItem(key, value)
				})
			}

			// Try to restore chrome.storage.local if available
			if (win.chrome && win.chrome.storage && win.chrome.storage.local) {
				const chromeStorage = allLocalStorage['chrome.storage.local']
				if (chromeStorage) {
					win.chrome.storage.local.set(chromeStorage)
				}
			}
		}

		// Restore sessionStorage for current origin
		const allSessionStorage = Cypress.env('allSessionStorage')
		if (allSessionStorage) {
			const currentOriginSessionStorage = allSessionStorage[win.location.origin]
			if (currentOriginSessionStorage) {
				Object.entries(currentOriginSessionStorage).forEach(([key, value]) => {
					win.sessionStorage.setItem(key, value)
				})
			}
		}
	})
})

Cypress.Commands.add('restoreSessionStorageForOrigin', (origin) => {
	cy.visit(origin).then(() => {
		cy.window().then((win) => {
			const allSessionStorage = Cypress.env('allSessionStorage')
			if (allSessionStorage && allSessionStorage[origin]) {
				// Clear existing sessionStorage
				win.sessionStorage.clear()

				// Restore sessionStorage for this origin
				Object.entries(allSessionStorage[origin]).forEach(([key, value]) => {
					win.sessionStorage.setItem(key, value)
				})

				cy.log(`Restored SessionStorage for ${origin}`)
			}
		})
	})
})
