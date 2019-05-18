import XElement from '../../lib/x-element/x-element.js'
import MixinModal from '../mixin-modal/mixin-modal.js'

export default class VMigrationWelcome extends MixinModal(XElement) {
    html() {
        return '<div><migration-welcome @finished="finished" ref="migrationWelcome"></migration-welcome></div>'
    }

    onCreate() {
        super.onCreate()
        const self = this

        this.vue = new Vue({
            el: this.$('div'),
            methods: {
                finished() {
                    self.hide()
                },
                reset() {
                    this.$refs.migrationWelcome.reset()
                },
            },
            components: {
                'migration-welcome': NimiqVueComponents.MigrationWelcome,
            }
        })
    }

    onShow() {
        this.vue.reset()
    }
}

