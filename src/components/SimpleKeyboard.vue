<template>
    <div :class="keyboardClass"></div>
</template>

<script>
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

export default {
    name: "SimpleKeyboard",
    props: {
        keyboardClass: {
            default: "simple-keyboard",
            type: String
        },
        input: {
            type: String
        },
        lang: {
            type: String,
            required: true
        }
    },
    data: () => ({
        keyboard: null,
        layouts: {
            en: {
                default: [
                    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                    "q w e r t y u i o p [ ] \\",
                    "a s d f g h j k l ; '",
                    "{shift} z x c v b n m , . / {shift}",
                    ".com @ {space}"
                ],
                shift: [
                    "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                    "Q W E R T Y U I O P { } |",
                    'A S D F G H J K L : "',
                    "{shift} Z X C V B N M < > ? {shift}",
                    ".com @ {space}"
                ]
            },
            hr: {
                default: [
                    "` 1 2 3 4 5 6 7 8 9 0 ' + {bksp}",
                    "q w e r t z u i o p š đ",
                    "a s d f g h j k l č ć ž",
                    "{shift} y x c v b n m , . - {shift}",
                    "@ {space}"
                ],
                shift: [
                    "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                    "Q W E R T Z U I O P Š Đ",
                    'A S D F G H J K L Č Ć Ž',
                    "{shift} Y X C V B N M ; : _ {shift}",
                    "@ {space}"
                ]
            },
            de: {
                default: [
                    "^ 1 2 3 4 5 6 7 8 9 0 ß ´ {bksp}",
                    "q w e r t z u i o p ü +",
                    "a s d f g h j k l ö ä #",
                    "{shift} y x c v b n m , . - {shift}",
                    "@ {space}"
                ],
                shift: [
                    "° ! \" § $ % & / ( ) = ? ` {bksp}",
                    "Q W E R T Z U I O P Ü *",
                    "A S D F G H J K L Ö Ä '",
                    "{shift} Y X C V B N M ; : _ {shift}",
                    "@ {space}"
                ]
            },
            fr: {
                default: [
                    "² & é \" ' ( § è ! ç à ) - {bksp}",
                    "a z e r t y u i o p ^ $",
                    "q s d f g h j k l m ù",
                    "{shift} w x c v b n , ; : = {shift}",
                    "@ {space}"
                ],
                shift: [
                    "³ 1 2 3 4 5 6 7 8 9 0 ° _ {bksp}",
                    "A Z E R T Y U I O P ¨ *",
                    "Q S D F G H J K L M %",
                    "{shift} W X C V B N ? . / + {shift}",
                    "@ {space}"
                ]
            },
            it: {
                default: [
                    "\\ 1 2 3 4 5 6 7 8 9 0 ' ì {bksp}",
                    "q w e r t y u i o p è +",
                    "a s d f g h j k l ò à ù",
                    "{shift} z x c v b n m , . - {shift}",
                    "@ {space}"
                ],
                shift: [
                    "| ! \" £ $ % & / ( ) = ? ^ {bksp}",
                    "Q W E R T Y U I O P É *",
                    "A S D F G H J K L Ç ° §",
                    "{shift} Z X C V B N M ; : _ {shift}",
                    "@ {space}"
                ]
            },
            num: {
                default: [
                    "7 8 9",
                    "4 5 6",
                    "1 2 3",
                    "0 {bksp}"
                ]
            },
        },
        displays: {
            en: { "{bksp}": "Delete", "{shift}": "shift", "{space}": " " },
            hr: { "{bksp}": "Obriši", "{shift}": "shift", "{space}": " " },
            de: { "{bksp}": "Löschen", "{shift}": "shift", "{space}": " " },
            fr: { "{bksp}": "Suppr.", "{shift}": "shift", "{space}": " " },
            it: { "{bksp}": "Cancella", "{shift}": "shift", "{space}": " " },
            es: { "{bksp}": "Borrar", "{shift}": "shift", "{space}": " " },
            nl: { "{bksp}": "Verwijder", "{shift}": "shift", "{space}": " " },
            num: { "{bksp}": "Delete", "{shift}": "shift", "{space}": " " }
        }
    }),
    mounted() {
        this.initKeyboard();
    },
    methods: {
        initKeyboard() {
            const layout = this.layouts[this.lang] || this.layouts.en;
            const display = this.displays[this.lang] || this.displays.en;
            this.keyboard = new Keyboard(this.keyboardClass, {
                onChange: this.onChange,
                onKeyPress: this.onKeyPress,
                layout: layout,
                display: display
            });
        },
        onChange(input) {
            this.$emit("onChange", input);
        },
        onKeyPress(button) {
            this.$emit("onKeyPress", button);

            if (button === "{shift}" || button === "{lock}") {
                this.handleShift();
            } else {
                if (this.keyboard.options.layoutName === "shift" && !button.startsWith("{")) {
                    this.keyboard.setOptions({
                        layoutName: "default"
                    });
                }
            }

            if (button === "{bksp}") {
                const currentInput = this.keyboard.getInput();
                this.keyboard.setInput(currentInput.slice(0, -1));
                this.$emit("onChange", this.keyboard.getInput());
            }
        },
        handleShift() {
            let currentLayout = this.keyboard.options.layoutName;
            let shiftToggle = currentLayout === "default" ? "shift" : "default";

            this.keyboard.setOptions({
                layoutName: shiftToggle
            });
        }
    },
    watch: {
        input(input) {
            this.keyboard.setInput(input);
        },
        lang(newLang) {
            const layout = this.layouts[newLang] || this.layouts.en;
            const display = this.displays[newLang] || this.displays.en;
            this.keyboard.setOptions({
                layout: layout,
                display: display
            });
        }
    }
};
</script>

<style scoped></style>