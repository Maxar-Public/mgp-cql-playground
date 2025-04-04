<template>
  <div class="custom-input" :class="{ 'has-value': inputValue, 'is-focused': isFocused }" :style="{ height: height }">
    <label v-if="label" :for="id" class="custom-input__label">{{ label }}</label>
    <div class="custom-input__wrapper" :style="{ fontSize: fontSize }">
      <span ref="display" class="custom-input__display" :style="{ fontSize: fontSize }"
        :class="{ 'has-scrollbar': hasScrollbar }">
        <span v-for="(word, index) in coloredWords" :key="index" class="word-wrapper">
          <span :style="{ color: word.color }">{{ word.text === " " ? "&nbsp;" : word.text }}</span>
          <span v-if="word.suggestion" :style="{ color: word.suggestionColor }">{{ word.suggestion }}</span>
        </span>
      </span>

      <textarea v-model="inputValue" :id="id" :placeholder="dynamicPlaceholder" :disabled="disabled"
        @input="updateValue" @keydown="handleKeyDown" @focus="handleFocus" @blur="handleBlur" @scroll="handleScroll"
        ref="textarea" spellcheck="false" class="custom-input__real-input"></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, onMounted } from "vue";

export default defineComponent({
  name: "CustomTextarea",
  props: {
    modelValue: { type: String, required: false },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    id: { type: String, default: () => 'input-' + Math.random().toString(36) },
    disabled: { type: Boolean, default: false },
    height: { type: String, default: "auto" },
    fontSize: { type: String, default: "14px" },
    wordsList: { type: Array as () => string[], default: () => [] },
    symbols: { type: Array as () => string[], default: () => [] },
    suggestionList: { type: Array as () => string[], default: () => [] },
    example: { type: String, default: "" },
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue || "");
    const textarea = ref<HTMLTextAreaElement | null>(null);
    const display = ref<HTMLDivElement | null>(null);
    const suggestion = ref(props.example || "");
    const isFocused = ref(false);
    const hasScrollbar = ref(false);
    const currentWord = ref("");

    const handleFocus = () => { isFocused.value = true; };
    const handleBlur = () => { isFocused.value = false; };

    const dynamicPlaceholder = computed(() => {
      return isFocused.value || inputValue.value ? props.placeholder : props.label;
    });

    const coloredWords = computed(() => {
      if (!inputValue.value) {
        return [];
      }

      const words = inputValue.value.split(/(\s+|[<>]=|<>|[><=+\-*/()&|%^]+)/g) || [];
      const cursorPosition = textarea.value?.selectionStart || 0;
      const isCursorAtEnd = cursorPosition === inputValue.value.length;

      return words.map(segment => {
        if (!segment.trim()) {
          return { text: segment, color: "green", suggestion: "", suggestionColor: "" };
        }

        const isSymbol = props.symbols.some(symbol => symbol.toLowerCase() === segment.toLowerCase()) || /^(<=|>=|<>)$/.test(segment);

        if (isSymbol) {
          return { text: segment, color: "purple", suggestion: "", suggestionColor: "" };
        }

        const isWordInList = props.wordsList.includes(segment);

        if (isWordInList) {
          return { text: segment, color: "purple", suggestion: "", suggestionColor: "" };
        }

        let isSuggestionMatch = false;
        let suggestion = "";

        if (segment === currentWord.value && isCursorAtEnd) {
          if (props.example && props.example.toLowerCase().startsWith(currentWord.value.toLowerCase())) {
            isSuggestionMatch = true;
            suggestion = props.example.slice(currentWord.value.length);
          } else {
            const matchedSuggestion = props.suggestionList.find(word =>
              word.toLowerCase().startsWith(currentWord.value.toLowerCase()) && word !== currentWord.value
            );
            if (matchedSuggestion) {
              isSuggestionMatch = true;
              suggestion = matchedSuggestion.slice(currentWord.value.length);
            }
          }
        }

        if (isSuggestionMatch) {
          return {
            text: segment,
            color: "purple",
            suggestion: suggestion,
            suggestionColor: "#999",
          };
        }

        return { text: segment, color: "green", suggestion: "", suggestionColor: "" };
      });
    });

    const updateSuggestion = () => {
      const cursorPosition = textarea.value?.selectionStart || 0;
      const isCursorAtEnd = cursorPosition === inputValue.value.length;

      if (isCursorAtEnd) {
        if (props.example && props.example.toLowerCase().startsWith(currentWord.value.toLowerCase())) {
          suggestion.value = props.example;
        } else {
          const match = props.suggestionList.find(word =>
            word.toLowerCase().startsWith(currentWord.value.toLowerCase()) && word !== currentWord.value
          );
          suggestion.value = match || "";
        }
      } else {
        suggestion.value = "";
      }
    };

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === 'Tab' && suggestion.value) {
        event.preventDefault();

        if (!textarea.value) return;

        const cursorPosition = textarea.value.selectionStart || 0;
        const isCursorAtEnd = cursorPosition === inputValue.value.length;

        if (isCursorAtEnd) {
          const textBeforeCursor = inputValue.value.substring(0, cursorPosition) || "";
          const textAfterCursor = inputValue.value.substring(cursorPosition) || "";

          const words = textBeforeCursor.split(/\s+/);
          words[words.length - 1] = suggestion.value;

          inputValue.value = words.join(" ") + textAfterCursor;
          suggestion.value = "";

          await nextTick();

          updateValue();
        }
      }
    };

    const handleScroll = () => {
      if (!display.value || !textarea.value) return;

      const textareaElement = textarea.value as HTMLTextAreaElement;
      const scrollTop = textareaElement.scrollTop;

      display.value.style.transform = `translateY(-${scrollTop}px)`;
    };

    const checkForScrollbar = () => {
      if (textarea.value) {
        const textareaElement = textarea.value as HTMLTextAreaElement;
        hasScrollbar.value = textareaElement.scrollHeight > textareaElement.clientHeight;
      }
    };

    const updateValue = () => {
      if (props.label === "Sort" && inputValue.value.includes("+")) {
        inputValue.value = inputValue.value.replace(/\+/g, " ");
      }
      emit("update:modelValue", inputValue.value);
      updateSuggestion();
    };

    const preventDoubleClickSelection = () => {
      if (textarea.value) {
        textarea.value.addEventListener('mousedown', (event) => {
          if (event.detail > 1) {
            event.preventDefault();
          }
        });
      }
    };

    onMounted(() => {
      preventDoubleClickSelection();
      checkForScrollbar();
    });

    watch(() => props.modelValue, (newValue) => {
      inputValue.value = newValue || "";
      updateSuggestion();
      checkForScrollbar();

      if (textarea.value) {
        textarea.value.focus();
      }
    });

    watch(inputValue, () => {
      if (!textarea.value) return;

      const cursorPosition = textarea.value.selectionStart || 0;
      const textBeforeCursor = inputValue.value.substring(0, cursorPosition) || "";
      currentWord.value = textBeforeCursor.trimEnd().split(/\s+/).pop() || "";
    });


    return {
      inputValue,
      coloredWords,
      updateValue,
      handleScroll,
      handleKeyDown,
      textarea,
      display,
      dynamicPlaceholder,
      handleFocus,
      handleBlur,
      isFocused,
      hasScrollbar
    };
  },
});
</script>

<style scoped>
.custom-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  position: relative;
}

.custom-input__label {
  position: absolute;
  top: 10%;
  left: 10px;
  font-size: 1rem;
  transform: translateY(-10%);
  transition: all 0.2s ease;
  color: #999;
  pointer-events: none;
  background-color: white;
  padding: 0px 5px;
}

.custom-input.has-value .custom-input__label,
.custom-input.is-focused .custom-input__label {
  top: -6px;
  font-size: 0.75rem;
  color: #333;
  z-index: 1000;
}

.custom-input__wrapper {
  position: relative;
  display: flex;
  padding: 8px;
  padding-left: 8px;
  padding-right: 0px;
  border: 1px solid #aaa8a8;
  border-radius: 4px;
  font-size: 1rem;
  background: #fff;
  min-height: 2.5rem;
  width: 100%;
  transition: border 0.3s ease;
  overflow: hidden;
  height: 160px;
  transition: outline 0.2s, border-color 0.2s;
  box-sizing: border-box;
}

.custom-input.is-focused .custom-input__wrapper {
  border-color: #333;
  outline: 1px solid #333;
}

.custom-input__display {
  position: absolute;
  left: 7px;
  right: 7px;
  pointer-events: none;
  letter-spacing: 0.3px;
  white-space: pre-wrap;
  width: calc(100% - 16px);
  word-wrap: break-word;
  word-break: break-all;
  resize: none;
  padding-left: 1px;
}

.custom-input__display.has-scrollbar {
  width: calc(100% - 32.5px);
}

.custom-input__real-input {
  position: relative;
  background: transparent;
  color: transparent;
  border: none;
  outline: none;
  caret-color: black;
  z-index: 1;
  width: 100%;
  font-size: inherit;
  letter-spacing: 0.3px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  resize: none;
  user-select: none;

  height: 100%;
  padding-right: 8px;
  padding-left: 1px;
}

.custom-input__real-input::placeholder {
  color: #858585;
}

.custom-input__real-input:focus {
  outline: none;
}

textarea {
  -webkit-text-decoration: none;
  text-decoration: none;
}
</style>