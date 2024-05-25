//import '@mdi/font/css/materialdesignicons.css' // If icons are required in the graphic views, uncomment this line and comment out the equivalent line in @/editor/EditorView.vue
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
    icons: {
        defaultSet: "mdi"
    },
    theme: {
        defaultTheme: "dark"
    }
})