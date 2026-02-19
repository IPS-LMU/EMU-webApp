const emuWebAppURL = 'http://127.0.0.1:9000/';
const audioGetUrl = 'http://127.0.0.1:7283/msajc003.wav';
const labelGetUrl = 'http://127.0.0.1:7283/msajc003_annot.json';

const fontFamilySelectOptions = ["Arial", "Courier New", "Helvetica Neue", "Comic Sans", "Georgia", "Lato"];
const fontWeightSelectOptions = [100, 200, 300, 400, 500, 600, "bold", "bolder", "light"];

class GUIController {
  constructor() {
    this.iframeLoaded = false;

    this.controls = {
      audioFileBuffer: undefined,
      annotation: undefined,
      iframe: undefined,
      applyButton: undefined,
      disableBundleListSidebarOption: undefined,
      saveToWindowParentOption: undefined,
      labelTypeOption: undefined,
      audioFileOption: undefined,
      transcriptFileOption: undefined,
      listenForMessagesOption: undefined,
      styleBlockingMessage: undefined,
      styleOptions: undefined,
      spectrogramOptions_: undefined,
      spectrogramOptionsWrapper: undefined
    };

    this.options = {
      disableBundleListSidebar: true,
      saveToWindowParent: true,
      labelType: 'annotJSON',
      listenForMessages: true,
    };
    this.styles = [
      {
        name: 'colorBlack',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorWhite',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorBlue',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorRed',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorYellow',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorGreen',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorGrey',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorLightGrey',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorDarkGrey',
        type: 'color',
        value: undefined,
        opacity: 1
      },
      {
        name: 'colorTransparentGrey',
        type: 'color',
        value: undefined,
        opacity: 1
      },
      {
        name: 'colorTransparentLightGrey',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorTransparentBlack',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorTransparentRed',
        type: 'color',
        value: undefined,
        opacity: 1
      }, {
        name: 'colorTransparentYellow',
        type: 'color',
        value: undefined,
        opacity: 1
      },
      {
        name: 'animationPeriod',
        type: 'number',
        value: undefined,
        opacity: 1
      },
      {
        name: 'spectrogram',
        type: 'spectrogram',
        value: undefined,
        opacity: 1
      },
      {
        name: 'fontSmallFamily',
        type: 'select',
        value: undefined,
        selectOptions: fontFamilySelectOptions,
      },
      {
        name: 'fontSmallSize',
        type: 'text',
        value: undefined,
      },
      {
        name: 'fontSmallWeight',
        type: 'select',
        value: undefined,
        selectOptions: fontWeightSelectOptions
      },
      {
        name: 'fontLargeFamily',
        type: 'select',
        value: undefined,
        selectOptions: fontFamilySelectOptions,
      },
      {
        name: 'fontLargeSize',
        type: 'text',
        value: undefined,
      },
      {
        name: 'fontLargeWeight',
        type: 'select',
        value: undefined,
        selectOptions: fontWeightSelectOptions
      },
      {
        name: 'fontInputFamily',
        type: 'select',
        value: undefined,
        selectOptions: fontFamilySelectOptions,
      },
      {
        name: 'fontInputSize',
        type: 'text',
        value: undefined,
      },
      {
        name: 'fontInputWeight',
        type: 'select',
        value: undefined,
        selectOptions: fontWeightSelectOptions
      },
      {
        name: 'fontCodeFamily',
        type: 'select',
        value: undefined,
        selectOptions: fontFamilySelectOptions,
      },
      {
        name: 'fontCodeSize',
        type: 'text',
        value: undefined,
      },
      {
        name: 'fontCodeWeight',
        type: 'select',
        value: undefined,
        selectOptions: fontWeightSelectOptions
      },
    ];
    this.initEventHandlers();
  }

  initEventHandlers(){
    this.applyOptions = () => {
      this.options.disableBundleListSidebar = this.controls.disableBundleListSidebarOption.checked;
      this.options.saveToWindowParent = this.controls.saveToWindowParentOption.checked;
      this.options.labelType = this.controls.labelTypeOption.value;

      if (this.options.listenForMessages) {
        this.controls.listenForMessagesOption.checked = true;
        this.controls.styleBlockingMessage.style.display = 'none';
        this.controls.styleOptions.style.display = 'block';
        this.controls.spectrogramOptionsWrapper.style.display = 'block';
      }

      if (!this.iframeLoaded) {
        this.controls.iframe.src = `${emuWebAppURL}${this.stringifyQueryParams(!this.options.listenForMessages ? {
          ...this.options,
          audioGetUrl,
          labelGetUrl
        } : {listenForMessages: true})}`;
      } else {
        this.sendOptionsToIFrame();
      }
    };
    
    this.applyStyleDefaultsFromEmuWebApp = (styles) => {
      for (const key of Object.keys(styles)) {
        const option = document.getElementById(`option-${key}`);
        if (option) {
          if (option.tagName.toLowerCase() === "select") {
            option.setAttribute("style", "");

            const style = this.styles.find(a => a.name === key);
            if (!style.selectOptions.find(a => a.toString() === styles[key])) {
              const newOption = document.createElement("option");
              newOption.setAttribute("value", styles[key]);
              newOption.innerText = styles[key];
              option.appendChild(newOption);
            }
            option.value = styles[key];

            this.styles.map((a) => {
              if (a.name === key) {
                a.value = styles[key];
              }
              return a;
            });
          } else if (option.getAttribute("type") === "color") {
            const value = {
              color: "",
              opacity: 1
            };

            if (/^#|rgb[^a]/g.exec(styles[key])) {
              value.color = styles[key];
            } else if(styles[key].indexOf("rgba") > -1) {
              const matches = /rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)(?:\s*,\s*([0-9]+\.?[0-9]+))?\)/g.exec(styles[key]);
              if (matches) {
                value.color = this.rgbToHex(Number(matches[1]), Number(matches[2]), Number(matches[3]));
                value.opacity = Number(matches[4]);
              } else {
                console.error(`no matches for ${key}`);
              }
            } else {
              console.error(`Unmatched value for ${key}: ${styles[key]}`);
            }

            option.setAttribute("class", option.className.replace("opacity-10", ""));
            option.value = value.color;

            const opacity = document.getElementById(`option-op-${key}`);
            opacity.setAttribute("style", "");
            opacity.value = value.opacity * 100;

            this.styles.map((a) => {
              if (a.name === key) {
                a.value = value.color;
                a.opacity = value.opacity;
              }
              return a;
            });
          } else if(option.getAttribute("type") === "text") {
            option.value = styles[key];

            this.styles.map((a) => {
              if (a.name === key) {
                a.value = styles[key];
              }
              return a;
            });
          } else if (option.getAttribute("type") === "number") {
            option.value = styles[key];

            this.styles.map((a) => {
              if (a.name === key) {
                a.value = styles[key];
              }
              return a;
            });
          }
        } else {
          console.error(`Couldn't set value for option ${key}`);
        }
      }
    };

    this.setStyle = () => {
      const params = {};
      for (const style of this.styles) {
        if (style.value !== undefined && style.type === "color") {
          if (style.value.indexOf("#") > -1) {
            params[style.name] = this.hexToRGB(style.value, style.opacity);
          } else if(style.value.indexOf("rgb") > -1) {
            const matches = /rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)(?:\s*,\s*([0-9]+\.?[0-9]+))?\)/g.exec(style.value);
            if (matches) {
              params[style.name] = `rgb(${matches[1]}, ${matches[2]}, ${matches[3]}, ${style.opacity})`;
            }
          }
        } else {
          params[style.name] = style.value;
        }
      }

      this.postCommand("set_style", {params});
    };

    this.onListenForMessagesOptionChange = (event) => {
      this.iframeLoaded = false;
      this.options.listenForMessages = event.target.checked;
      const fileInputs = document.getElementById('fileInputs');
      fileInputs.style.display = event.target.checked ? 'block' : 'none';
    };

    this.onAudioFileChange = async (event) => {
      const file = event.target.files[0];
      this.audioFileBuffer = await this.readFile(file, 'arraybuffer');
    };

    this.onTranscriptFileChange = async (event) => {
      const file = event.target.files[0];
      const annotJSONText = await this.readFile(file, 'text');
      try {
        this.annotation = JSON.parse(annotJSONText);
      } catch (e) {
        alert('Invalid JSON file');
        console.error(e);
      }
    };

    this.postCommand = (command, data) => {
      console.groupCollapsed(`POST COMMAND ${command} to Emu-webApp`);
      console.log("DATA");
      console.log(data);
      console.groupEnd();
      this.controls.iframe.contentWindow.postMessage(removeUndefinedORNullAttributes({
        type: "command",
        command,
        ...data
      }), '*');
    };

    this.postCommandAsync = async (command, data) => {
      return new Promise((resolve, reject) => {
        const handler = (event) => {
          if (event.data.type === "response") {
            if (event.data.command === command) {
              window.removeEventListener("message", handler);
              resolve(event.data.data);
            }
          }
        };
        window.addEventListener('message', handler);
        this.postCommand(command, data);
      });
    };

    this.onWindowMessageRetrieved = async (event) => {
      if (event?.data) {
        // valid data object
        console.groupCollapsed("GOT MESSAGE from EMU webApp");
        console.log(`----\n${new Date().toLocaleString()}: Received new data from iframe:`);
        console.log(event.data);
        console.log('----');
        console.groupEnd();

        if (event.data.trigger === "listening") {
          if (this.options.listenForMessages) {
            this.sendOptionsToIFrame();
          }
          const version = await this.postCommandAsync("get_version");
          console.log(`VERSION of Emu-webApp is ${version}`);
          const styles = await this.postCommandAsync("get_style");
          this.applyStyleDefaultsFromEmuWebApp(styles);
          this.iframeLoaded = true;
        }
      }
    };
  }

  initialize() {
    this.controls.iframe = document.getElementsByTagName('iframe')[0];
    window.addEventListener('message', this.onWindowMessageRetrieved);

    this.controls.applyButton = document.getElementById('applyButton');
    this.controls.applyButton.addEventListener('click', this.applyOptions);

    this.controls.styleBlockingMessage = document.getElementById('styleBlockingMessage');
    this.controls.styleOptions = document.getElementById('styleOptions');
    this.controls.spectrogramOptions = document.getElementById('spectrogramOptions');
    this.controls.spectrogramOptionsWrapper = document.getElementById('spectrogramOptionsWrapper');

    // options
    this.controls.disableBundleListSidebarOption = document.getElementById('disableBundleListSidebarOption');
    this.controls.disableBundleListSidebarOption.checked = this.options.disableBundleListSidebar;

    this.controls.saveToWindowParentOption = document.getElementById('saveToWindowParentOption');
    this.controls.saveToWindowParentOption.checked = this.options.saveToWindowParent;

    this.controls.labelTypeOption = document.getElementById('labelTypeOption');
    this.controls.labelTypeOption.value = this.options.labelType;

    this.controls.audioFileOption = document.getElementById('audioFileOption');
    this.controls.audioFileOption.addEventListener('change', this.onAudioFileChange);

    this.controls.transcriptFileOption = document.getElementById('transcriptFileOption');
    this.controls.transcriptFileOption.addEventListener('change', this.onTranscriptFileChange);

    this.controls.listenForMessagesOption = document.getElementById('listenForMessagesOption');
    this.controls.listenForMessagesOption.addEventListener('change', this.onListenForMessagesOptionChange);

    this.generateStyleOptions();
    this.applyOptions();
  }

  generateStyleOptions() {
    this.controls.styleOptions.innerHTML = '';

    const onSpectroColorChange = (event) => {
      const value = {
        heatMapColorAnchors: [
          [0,0,0],
          [0,0,0],
          [0,0,0]
        ]
      };

      const backColor = document.getElementById(`option-background-color`);
      value.heatMapColorAnchors[0] = backColor.value ? this.hexToRGBArray(backColor.value) : undefined;

      const foregroundColor = document.getElementById(`option-foreground-color`);
      value.heatMapColorAnchors[1] = foregroundColor.value ? this.hexToRGBArray(foregroundColor.value) : undefined;

      const heightColor = document.getElementById(`option-height-color`);
      value.heatMapColorAnchors[2] = heightColor.value ? this.hexToRGBArray(heightColor.value) : undefined;

      if (value.heatMapColorAnchors[0] !== undefined) {
        backColor.setAttribute("class", backColor.className.replace("opacity-10", ""));
      }

      if (value.heatMapColorAnchors[1] !== undefined) {
        foregroundColor.setAttribute("class", foregroundColor.className.replace("opacity-10", ""));
      }

      if (value.heatMapColorAnchors[2] !== undefined) {
        heightColor.setAttribute("class", heightColor.className.replace("opacity-10", ""));
      }

      this.styles = this.styles.map(a => a.name === "spectrogram" ? {
        ...a,
        value
      } : a);
      this.setStyle();
    };

    for (const style of this.styles) {
      if (style.type === "color") {
        const component = this.createOptionRow(style, () => {
          return this.createColorGroup(style,(event)=>{
            this.onColorChange(style.name, event.target.value);
            const picker = document.getElementById(`option-${style.name}`);
            picker.setAttribute("class", picker.className.replace("opacity-10", ""));
          }, (event)=>{
            this.onColorTransparencyChange(style.name, event.target.value);
          });
        });
        this.controls.styleOptions.appendChild(component);
      } else if (style.type === "spectrogram") {
        // generate spectrogram options
        const spectroBackColor = this.createOptionRow({
          name: "background-color",
          value: undefined
        }, () => {
          return this.createColorGroup({
            name: "background-color",
            value: undefined
          }, onSpectroColorChange);
        }, "px-1");
        this.controls.spectrogramOptions.appendChild(spectroBackColor);

        const spectroForegroundColor = this.createOptionRow({
          name: "foreground-color",
          value: undefined
        }, () => {
          return this.createColorGroup({
            name: "foreground-color",
            value: undefined
          }, onSpectroColorChange);
        }, "px-1");
        this.controls.spectrogramOptions.appendChild(spectroForegroundColor);

        const spectroHeightColor = this.createOptionRow({
          name: "height-color",
          value: undefined
        }, () => {
          return this.createColorGroup({
            name: "height-color",
            value: undefined
          }, onSpectroColorChange);
        }, "px-1");
        this.controls.spectrogramOptions.appendChild(spectroHeightColor);
      } else if (style.type === "number") {
        const numberField = this.createOptionRow(style, (event) => {
          return this.createNumberField(style, (event)=> {
            const parsedValue = Number(event.target.value);

            this.styles = this.styles.map(a => a.name === style.name ? {
              ...a,
              value: !Number.isNaN(parsedValue) ? parsedValue : undefined
            } : a);
            this.setStyle();
          });
        });
        this.controls.styleOptions.appendChild(numberField);
      } else if (style.type === "text") {
        const inputField = this.createOptionRow(style, () => {
          return this.createTextField(style, (event) => {
            this.styles = this.styles.map(a => a.name === style.name ? {
              ...a,
              value: event.target.value
            } : a);
            this.setStyle();
          });
        });

        this.controls.styleOptions.appendChild(inputField);
      } else if (style.type === "select") {
        const selectField = this.createOptionRow(style, () => {
          return this.createSelectInput(style, (event) => {
            const select = document.getElementById(`option-${style.name}`);
            select.setAttribute("style", event.target.value === "" ? "color: lightgray;": "");

            this.styles = this.styles.map(a => a.name === style.name ? {
              ...a,
              value: event.target.value
            } : a);
            this.setStyle();
          });
        });

        this.controls.styleOptions.appendChild(selectField);
      }
    }

    this.onColorChange = (name, value) => {
      this.styles = this.styles.map(a => a.name === name ? {
        ...a,
        value
      } : a);
      this.setStyle();
    };

    this.onColorTransparencyChange = (name, value) => {
      if(!isNaN(Number(value))) {
        this.styles = this.styles.map(a => a.name === name ? {
          ...a,
          opacity: Number(value)/100
        } : a);
        this.setStyle();
      }
    };
  }

  createOptionRow(style, generateComponent, additionalClasses) {
    const component = document.createElement('div');
    component.setAttribute("class", `list-group-item align-items-center ${additionalClasses ? additionalClasses: ""}`);

    const row = document.createElement("div");
    row.setAttribute("class", `row g-1`);

    const colLeft = document.createElement('div');
    colLeft.setAttribute('class', 'col-xl-12');

    const label = document.createElement('label');
    label.id = `${style.name}Label`;
    label.setAttribute("class", "form-label d-inline me-2 my-0");
    label.innerHTML = style.name;
    colLeft.appendChild(label);
    row.appendChild(colLeft);

    const colRight = document.createElement('div');
    colRight.setAttribute('class', 'col-xl-12');
    colRight.appendChild(generateComponent());
    row.appendChild(colRight);

    component.appendChild(row);
    return component;
  }

  createColorGroup(style, colorChangeCallback, opacityChangeCallback) {
    const colorGroup = document.createElement('div');
    colorGroup.setAttribute('class', 'd-flex flex-auto flex-row align-items-center');

    const color = document.createElement('input');
    color.setAttribute("type", "color");
    color.setAttribute("id", "option-" + style.name);
    color.setAttribute("class", "form-control form-control-color my-0 opacity-10");
    color.title = style.name;
    color.value = style.value;
    color.addEventListener("change", colorChangeCallback);
    colorGroup.appendChild(color);

    if (style.opacity !== undefined) {
      const inputGroup = document.createElement('div');
      inputGroup.setAttribute('class', 'input-group d-contents');

      const inputGroupText = document.createElement('span');
      inputGroupText.setAttribute('class', 'input-group-text d-inline-block');
      inputGroupText.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-transparency" viewBox="0 0 16 16">
  <path d="M0 6.5a6.5 6.5 0 0 1 12.346-2.846 6.5 6.5 0 1 1-8.691 8.691A6.5 6.5 0 0 1 0 6.5m5.144 6.358a5.5 5.5 0 1 0 7.714-7.714 6.5 6.5 0 0 1-7.714 7.714m-.733-1.269q.546.226 1.144.33l-1.474-1.474q.104.597.33 1.144m2.614.386a5.5 5.5 0 0 0 1.173-.242L4.374 7.91a6 6 0 0 0-.296 1.118zm2.157-.672q.446-.25.838-.576L5.418 6.126a6 6 0 0 0-.587.826zm1.545-1.284q.325-.39.576-.837L6.953 4.83a6 6 0 0 0-.827.587l4.6 4.602Zm1.006-1.822q.183-.562.242-1.172L9.028 4.078q-.58.096-1.118.296l3.823 3.824Zm.186-2.642a5.5 5.5 0 0 0-.33-1.144 5.5 5.5 0 0 0-1.144-.33z"/>
</svg>`;
      inputGroup.appendChild(inputGroupText);

      const textInput = document.createElement('input');
      textInput.setAttribute("id", "option-op-" + style.name);
      textInput.setAttribute('type', 'number');
      textInput.setAttribute("min", "0");
      textInput.setAttribute("max", "100");
      textInput.value = "100";
      textInput.setAttribute('class', 'form-control d-inline-block');
      textInput.addEventListener("change", opacityChangeCallback);
      inputGroup.appendChild(textInput);

      const percent = document.createElement('span');
      percent.setAttribute("class", "input-group-text");
      percent.innerText = "%";
      inputGroup.appendChild(percent);

      colorGroup.appendChild(inputGroup);
    }


    return colorGroup;
  }

  createNumberField(style, valueChangeCallback) {
      const numberInput = document.createElement('input');
      numberInput.setAttribute("id", "option-" + style.name);
      numberInput.setAttribute('type', 'number');
      numberInput.setAttribute("min", "0");
      numberInput.setAttribute('class', 'form-control d-inline-block w-100');
      numberInput.addEventListener("change", valueChangeCallback);

      return numberInput;
  }

  createTextField(style, valueChangeCallback) {
    const textInput = document.createElement('input');
    textInput.setAttribute("id", "option-" + style.name);
    textInput.setAttribute('type', 'text');
    textInput.setAttribute('class', 'form-control d-inline-block w-100');
    textInput.addEventListener("change", valueChangeCallback);

    return textInput;
  }

  createSelectInput(style, valueChangeCallback) {
    const selectInput = document.createElement('select');
    selectInput.setAttribute("id", "option-" + style.name);
    selectInput.setAttribute('class', 'form-select d-inline-block w-100');
    selectInput.setAttribute("style", "color: lightgray");

    const noValueOption = document.createElement('option');
    noValueOption.setAttribute('value', '');
    noValueOption.innerHTML = "Nothing selected";
    selectInput.appendChild(noValueOption);

    for (const selectElement of style.selectOptions) {
      const option = document.createElement('option');
      option.setAttribute('value', selectElement);
      option.innerHTML = selectElement;
      selectInput.appendChild(option);
    }

    selectInput.addEventListener("change", valueChangeCallback);

    return selectInput;
  }

  sendOptionsToIFrame() {
    const data = {
      params: this.options,
    };

    if (this.audioFileBuffer) {
      data.params.audioArrayBuffer = this.audioFileBuffer;

      if (this.annotation) {
        data.params.annotation = this.annotation;
      }
    } else {
      data.params.audioGetUrl = audioGetUrl;
      data.params.labelGetUrl = labelGetUrl;
    }

    this.postCommand("load", data);
  }

  async readFile(blob, type){
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.addEventListener('load', function () {
        resolve(reader.result);
      });
      reader.addEventListener('error', reject);
      if (type === 'text') {
        reader.readAsText(blob, 'utf-8');
      } else {
        reader.readAsArrayBuffer(blob);
      }
    });
  }

  hexToRGB(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    if (alpha !== undefined) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  }

  hexToRGBArray(hex) {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    return [r,g,b];
  }

  rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }

  /**
   * returns a string representing query parameters and their values without empty values.
   * @param params
   */
  stringifyQueryParams(params) {
    if (!params) {
      return '';
    }

    const strArray = [];

    for (const key of Object.keys(params)) {
      let value = params[key];
      if (value !== undefined) {
        if (typeof value !== 'string' && Array.isArray(value)) {
          value = value.join(',');
        }
        if (typeof value === 'boolean' && value === false) {
          continue;
        }
        strArray.push(`${key}=${encodeURIComponent(value)}`);
      }
    }

    return strArray.length > 0 ? `?${strArray.join('&')}` : '';
  }
}

new GUIController().initialize();

function removeUndefinedORNullAttributes(obj) {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    } else if(typeof obj[key] === 'object') {
      obj[key] = removeUndefinedORNullAttributes(obj[key]);
    }
  }

  return obj;
}
