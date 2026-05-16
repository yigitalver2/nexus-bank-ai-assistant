export async function createPeerConnection() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const pc = new RTCPeerConnection();

  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  document.body.appendChild(audioEl);

  pc.ontrack = (e) => {
    const stream = e.streams[0];

    try {
      const actx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
      const src  = actx.createMediaStreamSource(stream);

      // Telefon/kulaklık bandpass filtresi: 300–3400 Hz
      const hi = actx.createBiquadFilter();
      hi.type = "highpass";
      hi.frequency.value = 300;
      hi.Q.value = 0.7;

      const lo = actx.createBiquadFilter();
      lo.type = "lowpass";
      lo.frequency.value = 3400;
      lo.Q.value = 0.7;

      // Hafif kompresyon — kulaklık sıkışıklığı hissi
      const comp = actx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 8;
      comp.ratio.value = 5;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;

      src.connect(hi);
      hi.connect(lo);
      lo.connect(comp);
      comp.connect(actx.destination);

      if (actx.state === "suspended") actx.resume();
    } catch {
      // Web Audio API yoksa fallback
      audioEl.srcObject = stream;
    }
  };

  return pc;
}


export async function exchangeSDP(pc, clientSecret) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const response = await fetch(
    "https://api.openai.com/v1/realtime/calls",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientSecret}`,
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
    }
  );

  const answerSdp = await response.text();

  if (!response.ok) {
    console.error("[webrtc] SDP exchange failed:", response.status, answerSdp);
    throw new Error(`SDP exchange failed: ${response.status} ${answerSdp}`);
  }

  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
}


export function createDataChannel(pc) {
  return pc.createDataChannel("oai-events");
}
