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
    audioEl.srcObject = e.streams[0];
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
