export async function createPeerConnection() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
    "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
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
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
}


export function createDataChannel(pc) {
  return pc.createDataChannel("oai-events");
}
