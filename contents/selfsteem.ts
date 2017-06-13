require('es6-promise').polyfill()
import main from './scripts/main'
window.addEventListener('DOMContentLoaded', () => {
    main(window['config']).catch((error) => {
        console.error('Could not start application', error)
    })
})
