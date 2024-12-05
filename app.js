let outputNode;
let device;
let context;

document.body.onclick = function () {
    setup();
};

function connectMicrophone(device) {
    // getUserMedia block - grab stream
    // put it into a MediaStreamAudioSourceNode
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia(
          // constraints: audio and video for this app
          {
            audio: true,
            video: false
          }
        )
        .then((stream) => {
          const options = {
            mediaStream: stream
          };
  
          const source = new MediaStreamAudioSourceNode(context, options);
          source.connect(device.node);
          console.log("connected mic");
        })
        .catch((err) => {
          console.error(`The following gUM error occurred: ${err}`);
        });
    } else {
      console.log("new getUserMedia not supported on your browser!");
    }
}

async function setup() {
    const patchExportURL = "patch.export.json";

    // Create AudioContext

    if (!outputNode){
    const WAContext = window.AudioContext || window.webkitAudioContext;
    context = new WAContext();

    // Create gain node and connect it to audio output
    outputNode = context.createGain();
    outputNode.connect(context.destination);
    
    // Fetch the exported patcher
    let response, patcher;
    try {
        response = await fetch(patchExportURL);
        patcher = await response.json();
    
        if (!window.RNBO) {
            // Load RNBO script dynamically
            // Note that you can skip this by knowing the RNBO version of your patch
            // beforehand and just include it using a <script> tag
            await loadRNBOScript(patcher.desc.meta.rnboversion);
        }

    } catch (err) {
        const errorContext = {
            error: err
        };
        if (response && (response.status >= 300 || response.status < 200)) {
            errorContext.header = `Couldn't load patcher export bundle`,
            errorContext.description = `Check app.js to see what file it's trying to load. Currently it's` +
            ` trying to load "${patchExportURL}". If that doesn't` + 
            ` match the name of the file you exported from RNBO, modify` + 
            ` patchExportURL in app.js.`;
        }
        if (typeof guardrails === "function") {
            guardrails(errorContext);
        } else {
            throw err;
        }
        return;
    }
    
    // (Optional) Fetch the dependencies
    let dependencies = [];
    try {
        const dependenciesResponse = await fetch("dependencies.json");
        dependencies = await dependenciesResponse.json();

        // Prepend "export" to any file dependenciies
        dependencies = dependencies.map(d => d.file ? Object.assign({}, d, { file: "export/" + d.file }) : d);
    } catch (e) {}

    // Create the device
    try {
        device = await RNBO.createDevice({ context, patcher });
    } catch (err) {
        if (typeof guardrails === "function") {
            guardrails({ error: err });
        } else {
            throw err;
        }
        return;
    }

    // (Optional) Load the samples
    if (dependencies.length)
        await device.loadDataBufferDependencies(dependencies);

    // Connect the device to the web audio graph
    device.node.connect(outputNode);

    // (Optional) Extract the name and rnbo version of the patcher from the description
    document.getElementById("patcher-title").innerText = "Voice Changer Website";

    // (Optional) Automatically create sliders for the device parameters
    makeButtons(device);

    connectMicrophone(device);
    context.resume();

    // (Optional) Create a form to send messages to RNBO inputs
    //makeInportForm(device);

    // (Optional) Attach listeners to outports so you can log messages from the RNBO patcher
    //attachOutports(device);

    // (Optional) Load presets, if any
    //loadPresets(device, patcher);

    // (Optional) Connect MIDI inputs
    //makeMIDIKeyboard(device);

    // Skip if you're not using guardrails.js
    if (typeof guardrails === "function")
        guardrails();
}
}

function loadRNBOScript(version) {
    return new Promise((resolve, reject) => {
        if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
            throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
        }
        const el = document.createElement("script");
        el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
        el.onload = resolve;
        el.onerror = function(err) {
            console.log(err);
            reject(new Error("Failed to load rnbo.js v" + version));
        };
        document.body.append(el);
    });
}

function makeButtons(device) {
    device.parameters.forEach(param => {
        let pdiv = document.getElementById("rnbo-parameter-sliders");
        let label1 = document.createElement("label");
        let button1 = document.createElement("button");
        let button1Container = document.createElement("div");
        button1.appendChild(label1);
        button1Container.appendChild(button1);
        label1.textContent = "Alien";
        button1.value = "0";
        button1.onclick = button1clicked;
        function button1clicked(){
            let val = Number.parseInt(button1.value);
            param.value = val;
        }

        let label2 = document.createElement("label");
        let button2 = document.createElement("button");
        let button2Container = document.createElement("div");
        button2.appendChild(label2);
        button2Container.appendChild(button2);
        label2.textContent = "Robot";
        button2.value = "1";
        button2.onclick = button2clicked;
        function button2clicked(){
            let val = Number.parseInt(button2.value);
            param.value = val;
            console.log(button2.value);
            console.log(param.value);
        }

        let label3 = document.createElement("label");
        let button3 = document.createElement("button");
        let button3Container = document.createElement("div");
        button3.appendChild(label3);
        button3Container.appendChild(button3);
        label3.textContent = "Ghost";
        button3.value = "2";
        button3.onclick = button3clicked;
        function button3clicked(){
            let val = Number.parseInt(button3.value);
            param.value = val;
        }

        let label4 = document.createElement("label");
        let button4 = document.createElement("button");
        let button4Container = document.createElement("div");
        button4.appendChild(label4);
        button4Container.appendChild(button4);
        label4.textContent = "Underwater";
        button4.value = "3";
        button4.onclick = button4clicked;
        function button4clicked(){
            let val = Number.parseInt(button4.value);
            param.value = val;
        }

        let label5 = document.createElement("label");
        let button5 = document.createElement("button");
        let button5Container = document.createElement("div");
        button5.appendChild(label5);
        button5Container.appendChild(button5);
        label5.textContent = "Mountain Echo";
       button5.value = "5";
        button5.onclick = button5clicked;
        function button5clicked(){
            let val = Number.parseInt(button5.value);
            param.value = val;
        }

        pdiv.appendChild(button1Container);
        pdiv.appendChild(button2Container);
        pdiv.appendChild(button3Container);
        pdiv.appendChild(button4Container);
        pdiv.appendChild(button5Container);
    });
    
}

function makeInportForm(device) {
    const idiv = document.getElementById("rnbo-inports");
    const inportSelect = document.getElementById("inport-select");
    const inportText = document.getElementById("inport-text");
    const inportForm = document.getElementById("inport-form");
    let inportTag = null;
    
    // Device messages correspond to inlets/outlets or inports/outports
    // You can filter for one or the other using the "type" of the message
    const messages = device.messages;
    const inports = messages.filter(message => message.type === RNBO.MessagePortType.Inport);

    if (inports.length === 0) {
        idiv.removeChild(document.getElementById("inport-form"));
        return;
    } else {
        idiv.removeChild(document.getElementById("no-inports-label"));
        inports.forEach(inport => {
            const option = document.createElement("option");
            option.innerText = inport.tag;
            inportSelect.appendChild(option);
        });
        inportSelect.onchange = () => inportTag = inportSelect.value;
        inportTag = inportSelect.value;

        inportForm.onsubmit = (ev) => {
            // Do this or else the page will reload
            ev.preventDefault();

            // Turn the text into a list of numbers (RNBO messages must be numbers, not text)
            const values = inportText.value.split(/\s+/).map(s => parseFloat(s));
            
            // Send the message event to the RNBO device
            let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inportTag, values);
            device.scheduleEvent(messageEvent);
        }
    }
}

function attachOutports(device) {
    const outports = device.outports;
    if (outports.length < 1) {
        document.getElementById("rnbo-console").removeChild(document.getElementById("rnbo-console-div"));
        return;
    }

    document.getElementById("rnbo-console").removeChild(document.getElementById("no-outports-label"));
    device.messageEvent.subscribe((ev) => {

        // Ignore message events that don't belong to an outport
        if (outports.findIndex(elt => elt.tag === ev.tag) < 0) return;

        // Message events have a tag as well as a payload
        console.log(`${ev.tag}: ${ev.payload}`);

        document.getElementById("rnbo-console-readout").innerText = `${ev.tag}: ${ev.payload}`;
    });
}

function loadPresets(device, patcher) {
    let presets = patcher.presets || [];
    if (presets.length < 1) {
        document.getElementById("rnbo-presets").removeChild(document.getElementById("preset-select"));
        return;
    }

    document.getElementById("rnbo-presets").removeChild(document.getElementById("no-presets-label"));
    let presetSelect = document.getElementById("preset-select");
    presets.forEach((preset, index) => {
        const option = document.createElement("option");
        option.innerText = preset.name;
        option.value = index;
        presetSelect.appendChild(option);
    });
    presetSelect.onchange = () => device.setPreset(presets[presetSelect.value].preset);
}

function makeMIDIKeyboard(device) {
    let mdiv = document.getElementById("rnbo-clickable-keyboard");
    if (device.numMIDIInputPorts === 0) return;

    mdiv.removeChild(document.getElementById("no-midi-label"));

    const midiNotes = [49, 52, 56, 63];
    midiNotes.forEach(note => {
        const key = document.createElement("div");
        const label = document.createElement("p");
        label.textContent = note;
        key.appendChild(label);
        key.addEventListener("pointerdown", () => {
            let midiChannel = 0;

            // Format a MIDI message paylaod, this constructs a MIDI on event
            let noteOnMessage = [
                144 + midiChannel, // Code for a note on: 10010000 & midi channel (0-15)
                note, // MIDI Note
                100 // MIDI Velocity
            ];
        
            let noteOffMessage = [
                128 + midiChannel, // Code for a note off: 10000000 & midi channel (0-15)
                note, // MIDI Note
                0 // MIDI Velocity
            ];
        
            // Including rnbo.min.js (or the unminified rnbo.js) will add the RNBO object
            // to the global namespace. This includes the TimeNow constant as well as
            // the MIDIEvent constructor.
            let midiPort = 0;
            let noteDurationMs = 250;
        
            // When scheduling an event to occur in the future, use the current audio context time
            // multiplied by 1000 (converting seconds to milliseconds) for now.
            let noteOnEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000, midiPort, noteOnMessage);
            let noteOffEvent = new RNBO.MIDIEvent(device.context.currentTime * 1000 + noteDurationMs, midiPort, noteOffMessage);
        
            device.scheduleEvent(noteOnEvent);
            device.scheduleEvent(noteOffEvent);

            key.classList.add("clicked");
        });

        key.addEventListener("pointerup", () => key.classList.remove("clicked"));

        mdiv.appendChild(key);
    });
}

