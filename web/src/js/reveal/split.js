import { classList } from '../hermes';

const hiddenWrapper = document.getElementById('split');
const hiddenDiv = document.getElementById('split-text');
const indentDiv = document.getElementById('split-indent');

export class Split {
  constructor({
    target,
    indent = {},
    line = true,
    char = false,
    word = false,
    classes = {},
  }) {
    this.target = target;
    this.indent = {
      value: 0,
      from: 0,
      to: 1,
      computed: 0,
      ...indent,
    };
    this.line = line;
    this.char = char;
    this.word = word;
    this.settings = {
      classes: {
        wrapper: 'l-wrapper',
        line: 'l-line',
        word: 'l-word',
        char: 'l-char',
        charLine: 'l-char--line',
        charWrapper: 'l-char--wrapper',
        ...classes,
      },
    };

    this.html = this.target?.innerHTML;
    this.originalText = this.target?.textContent;
    this.text = this.originalText?.replace(/\s\s+/g, ' ').trim();

    // eslint-disable-next-line no-nested-ternary
    this.mode = char ? 'chars' : word ? 'words' : 'lines';

    this.lines = [];
    this.dom = {
      lines: [],
      chars: [],
      words: [],
    };

    this.target.ariaLabel = this.text;
    this.target.ariaHidden = true;
  }

  resize = () => {
    if (this.line) {
      this.setHiddenStyle();

      const offsetwidth = this.target.offsetWidth;
      const indentWidth = offsetwidth - (this.indent?.computed ?? 0);

      let curline = [];
      let lines = [];
      const tokens = this.text.split(' '); // words

      for (let i = 0, n = tokens.length; i < n; i++) {
        const token = tokens[i];
        curline.push(token);
        hiddenDiv.innerHTML = curline.join(' ');

        // handle indent
        let maxwidth = offsetwidth;
        if (
          this.indent?.value
          && lines.length >= this.indent.from
          && lines.length < this.indent.to
        ) {
          maxwidth = indentWidth;
        }

        if (hiddenDiv.offsetWidth >= maxwidth) {
          curline.pop();
          lines.push(curline.join(' '));
          curline = [token];
        }
      }

      lines.push(curline.join(' '));
      lines = lines.filter((el) => el.length);
      this.lines = lines;

      hiddenDiv.innerHTML = null;
    } else {
      this.lines = [this.text];
    }

    this.createDom();
  };

  createDom = (target = this.target, lines = this.lines) => {
    const { classes } = this.settings;
    const frag = document.createDocumentFragment();
    this.dom.lines = [];
    this.dom.chars = [];
    this.dom.words = [];

    lines.forEach((line, idx) => {
      const wrapper = document.createElement('div');
      const lineEl = document.createElement('div');

      classList.add(wrapper, classes.wrapper);
      classList.add(lineEl, classes.line);

      if (this.char) {
        // char mode
        lineEl.classList.add(classes.charLine);
        for (let i = 0, n = line.length; i < n; i++) {
          if (line[i] === ' ') {
            const spaceEl = document.createTextNode(' ');
            lineEl.appendChild(spaceEl);
          } else {
            const charWrapper = document.createElement('div');
            const charEl = document.createElement('div');

            classList.add(charWrapper, classes.charWrapper);
            classList.add(charEl, classes.char);

            charEl.innerHTML = line[i];

            this.dom.chars.push(charEl);

            charWrapper.appendChild(charEl);
            lineEl.appendChild(charWrapper);
          }
        }
      } else if (this.word) {
        // word mode
        const words = line.split(' ');

        for (let i = 0, n = words.length; i < n; i++) {
          const wordEl = document.createElement('div');
          const spaceEl = document.createTextNode(' ');

          wordEl.innerHTML = words[i];
          classList.add(wordEl, classes.word);

          this.dom.words.push(wordEl);

          lineEl.append(wordEl);
          lineEl.append(spaceEl);
        }
      } else {
        // line mode
        lineEl.innerHTML = line;
      }

      if (
        this.indent?.computed
        && idx >= this.indent.from
        && idx < this.indent.to
      ) {
        lineEl.style.textIndent = `${this.indent.value}`;
      }

      this.dom.lines.push(lineEl);

      wrapper.appendChild(lineEl);
      frag.appendChild(wrapper);
    });

    target.innerHTML = null;
    target.appendChild(frag);
  };

  setHiddenStyle = (target = this.target) => {
    const comp = getComputedStyle(target);
    const s = hiddenWrapper.style;
    s.fontFamily = comp.getPropertyValue('font-family');
    s.fontSize = comp.getPropertyValue('font-size');
    s.fontWeight = comp.getPropertyValue('font-weight');
    s.letterSpacing = comp.getPropertyValue('letter-spacing');
    s.textTransform = comp.getPropertyValue('text-transform');

    // indent
    if (this.indent?.value) {
      indentDiv.style.width = this.indent.value;
      this.indent.computed = indentDiv.offsetWidth;
    }
  };

  restore = () => {
    this.target.innerHTML = this.html;
    this.dom.lines = [];
    this.dom.chars = [];
    this.dom.words = [];
  };
}
