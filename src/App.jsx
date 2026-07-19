import { useState, useRef, useEffect, useCallback } from "react";

const CHANNELS = [
  {
    id: "willow tv",
    name: "Willow TV",
    tag: "CRICKET",
    color: "#22c55e",
    src: "https://amg01269-amg01269c1-sportstribal-emea-5204.playouts.now.amagi.tv/playlist/amg01269-willowtvfast-willowplus-sportstribalemea/playlist.m3u8",
    type: "hls",
    description: "Live Cricket Coverage",
    icon: "🏏",
  },
  {
    id: "Go USA",
    name: "GO USA TV",
    tag: "Travel",
    color: "#22c55e",
    src: "https://brandusa-gousa-1-be.samsung.wurl.tv/playlist.m3u8",
    type: "hls",
    description: "Travel Coverage",
    icon: "🧳",
  },
  {
    id: "sony",
    name: "Sony Sports",
    tag: "Cricket",
    color: "#22c55e",
    src: "https://twitcasting.tv/g:108062897540699902926/embeddedplayer/live",
    type: "iframe",
    description: "Cricket Coverage",
    icon: "🏏",
  },
  {
    id: "willow cricbuzz",
    name: "Willow Cricbuzz",
    tag: "Cricket",
    color: "#22c55e",
    src: "https://channel-13-alpha.vercel.app/",
    type: "iframe",
    description: "Cricket Coverage",
    icon: "🏏",
  },

  {
    id: "zee",
    name: "Zee Cinema",
    tag: "MOVIES",
    color: "#f59e0b",
    src: "https://zee-seven.vercel.app/",
    type: "iframe",
    description: "Blockbuster Hindi Movies",
    icon: "🎬",
  },

  {
    id: "Star 1",
    name: "Sport 1 HD",
    tag: "Cricket",
    color: "#e7b55d",
    src: "https://tatticdn.pages.dev/CDN3/?ch=H1",
    type: "iframe",
    description: "Cricket",
    icon: "🏏",
  },

  {
    id: "Star 2",
    name: "Sport 2 HD",
    tag: "Cricket",
    color: "#e7b55d",
    src: "https://tatticdn.pages.dev/CDN3/?ch=H2",
    type: "iframe",
    description: "Cricket",
    icon: "🏏",
  },
];

const QUALITIES = ["Auto", "1080p", "720p", "480p", "360p"];

function NavyLogo() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="logoGrad"
          x1="0"
          y1="0"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="12" fill="url(#logoGrad)" />
      <polygon points="16,13 34,22 16,31" fill="white" opacity="0.95" />
      <path
        d="M10 10 Q5 22 10 34"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M7 7 Q0 22 7 37"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
    </svg>
  );
}

export default function NavyHUB() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [showControls, setShowControls] = useState(true);
  const [showQuality, setShowQuality] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [notification, setNotification] = useState(null);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const playerWrapRef = useRef(null);
  const controlsTimer = useRef(null);
  const notifTimer = useRef(null);

  const showNotif = (msg) => {
    setNotification(msg);
    clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), 1800);
  };

  useEffect(() => {
    if (window.Hls) {
      setHlsLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.10/hls.min.js";
    s.onload = () => setHlsLoaded(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (activeChannel.type === "iframe") return;
    if (!hlsLoaded || !videoRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    setIsBuffering(true);
    setIsPlaying(false);

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(activeChannel.src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.muted = true;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsMuted(true);
          })
          .catch(() => {});
      });
      hls.on(window.Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setIsBuffering(false);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = activeChannel.src;
      video.addEventListener("loadedmetadata", () => {
        setIsBuffering(false);
        video.muted = true;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsMuted(true);
          })
          .catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel, hlsLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeChannel.type === "iframe") return;
    const onTime = () => setCurrentTime(video.currentTime);
    const onDur = () => setDuration(video.duration);
    const onWait = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDur);
    video.addEventListener("waiting", onWait);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDur);
      video.removeEventListener("waiting", onWait);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
    };
  }, [activeChannel]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3200);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });
      showNotif("▶ Playing");
    } else {
      video.pause();
      showNotif("⏸ Paused");
    }
  };

  const rewind = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      videoRef.current.currentTime - 10,
    );
    showNotif("⏪ −10s");
  };

  const forward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      duration || 0,
      videoRef.current.currentTime + 10,
    );
    showNotif("⏩ +10s");
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
    showNotif(next ? "🔇 Muted" : "🔊 Unmuted");
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setIsMuted(v === 0);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * duration;
  };

  const toggleFullscreen = () => {
    const el = playerWrapRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "Live";
    const m = Math.floor(s / 60),
      sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const switchChannel = (ch) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setActiveChannel(ch);
    setCurrentTime(0);
    setDuration(0);
    showNotif(`📺 ${ch.name}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#07080f 0%,#0d1117 60%,#080d14 100%)",
        fontFamily: "'Inter','Segoe UI',sans-serif",
        color: "#e2e8f0",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          height: "64px",
          background: "rgba(6,8,20,0.92)",
          borderBottom: "1px solid rgba(99,102,241,0.2)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <NavyLogo />
          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                background: "linear-gradient(90deg,#818cf8,#22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NavyHUB
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "#475569",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
              }}
            >
              LIVE STREAMING
            </div>
          </div>
        </div>
        <span
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#f87171",
            padding: "3px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          ● LIVE
        </span>
      </header>

      <main
        style={{ maxWidth: "1160px", margin: "0 auto", padding: "24px 20px" }}
      >
        {/* Channel Pills */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => switchChannel(ch)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                transition: "all 0.2s",
                background:
                  activeChannel.id === ch.id
                    ? `linear-gradient(135deg,${ch.color}28,${ch.color}10)`
                    : "rgba(255,255,255,0.04)",
                color: activeChannel.id === ch.id ? ch.color : "#64748b",
                outline:
                  activeChannel.id === ch.id
                    ? `2px solid ${ch.color}60`
                    : "2px solid transparent",
                boxShadow:
                  activeChannel.id === ch.id
                    ? `0 4px 20px ${ch.color}30`
                    : "none",
              }}
            >
              <span style={{ fontSize: "20px" }}>{ch.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div>{ch.name}</div>
                <div
                  style={{
                    fontSize: "10px",
                    opacity: 0.65,
                    letterSpacing: "1.5px",
                  }}
                >
                  {ch.tag}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Player */}
        <div
          ref={playerWrapRef}
          onMouseMove={resetControlsTimer}
          onTouchStart={resetControlsTimer}
          style={{
            position: "relative",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#000",
            aspectRatio: "16/9",
            boxShadow: `0 0 0 1px rgba(99,102,241,0.18), 0 28px 72px rgba(0,0,0,0.65), 0 0 80px ${activeChannel.color}18`,
          }}
        >
          {activeChannel.type === "iframe" ? (
            <iframe
              src={activeChannel.src}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
              title={activeChannel.name}
            />
          ) : (
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                background: "#000",
              }}
              playsInline
              muted={isMuted}
              onClick={togglePlay}
            />
          )}

          {/* Unmute Banner */}
          {isMuted && isPlaying && activeChannel.type !== "iframe" && (
            <div
              onClick={() => {
                setIsMuted(false);
                if (videoRef.current) videoRef.current.muted = false;
              }}
              style={{
                position: "absolute",
                bottom: "70px",
                right: "14px",
                background: "rgba(0,0,0,0.78)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "7px 16px",
                borderRadius: "30px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                zIndex: 15,
                animation: "pulse 2s infinite",
              }}
            >
              🔇 Muted — Click to Unmute
            </div>
          )}

          {/* Spinner */}
          {isBuffering && activeChannel.type !== "iframe" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  border: `3px solid ${activeChannel.color}33`,
                  borderTopColor: activeChannel.color,
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          )}

          {/* Toast */}
          {notification && (
            <div
              style={{
                position: "absolute",
                top: "18px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.82)",
                backdropFilter: "blur(8px)",
                padding: "7px 20px",
                borderRadius: "30px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                pointerEvents: "none",
                zIndex: 20,
                whiteSpace: "nowrap",
              }}
            >
              {notification}
            </div>
          )}

          {/* Controls */}
          {activeChannel.type !== "iframe" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                background: showControls
                  ? "linear-gradient(to top,rgba(0,0,0,0.88) 0%,transparent 55%)"
                  : "transparent",
                opacity: showControls ? 1 : 0,
                transition: "opacity 0.3s",
                zIndex: 10,
              }}
            >
              {/* Seek */}
              <div style={{ padding: "0 16px 8px" }}>
                {duration > 0 ? (
                  <div
                    onClick={handleSeek}
                    style={{
                      height: "4px",
                      background: "rgba(255,255,255,0.18)",
                      borderRadius: "2px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "2px",
                        width: `${(currentTime / duration) * 100}%`,
                        background: `linear-gradient(90deg,${activeChannel.color},#818cf8)`,
                        transition: "width 0.4s linear",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#f87171",
                        fontWeight: 700,
                      }}
                    >
                      LIVE
                    </span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "0 14px 14px",
                }}
              >
                <Btn onClick={rewind}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11 5L1 12L11 19V14.5C16.55 14.5 20.5 16.5 23 21C22 15.5 18.5 10.5 11 9.5V5Z" />
                    <text
                      x="5"
                      y="13.5"
                      fontSize="5.5"
                      fill="black"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      10
                    </text>
                  </svg>
                </Btn>

                <Btn onClick={togglePlay} big>
                  {isPlaying ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polygon points="5,3 20,12 5,21" />
                    </svg>
                  )}
                </Btn>

                <Btn onClick={forward}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13 5L23 12L13 19V14.5C7.45 14.5 3.5 16.5 1 21C2 15.5 5.5 10.5 13 9.5V5Z" />
                    <text
                      x="19"
                      y="13.5"
                      fontSize="5.5"
                      fill="black"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      10
                    </text>
                  </svg>
                </Btn>

                <Btn onClick={toggleMute}>
                  {isMuted ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.22 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.62 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 18.04 14.83 18.45 14 18.7V20.76C15.38 20.45 16.63 19.82 17.68 18.96L19.73 21L21 19.73L12 10.73L4.27 3ZM12 4L9.91 6.09L12 8.18V4Z" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z" />
                    </svg>
                  )}
                </Btn>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  style={{
                    width: "68px",
                    accentColor: activeChannel.color,
                    cursor: "pointer",
                  }}
                />

                <span
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    marginLeft: "4px",
                    minWidth: "80px",
                  }}
                >
                  {duration > 0
                    ? `${fmt(currentTime)} / ${fmt(duration)}`
                    : "● LIVE"}
                </span>

                <div style={{ flex: 1 }} />

                {/* Quality */}
                <div style={{ position: "relative" }}>
                  <Btn onClick={() => setShowQuality((v) => !v)}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {quality}
                    </span>
                  </Btn>
                  {showQuality && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        right: 0,
                        background: "rgba(8,10,22,0.97)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        borderRadius: "10px",
                        overflow: "hidden",
                        minWidth: "88px",
                        backdropFilter: "blur(12px)",
                        zIndex: 30,
                      }}
                    >
                      {QUALITIES.map((q) => (
                        <div
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowQuality(false);
                            showNotif(`📺 ${q}`);
                          }}
                          style={{
                            padding: "8px 16px",
                            fontSize: "13px",
                            cursor: "pointer",
                            color:
                              quality === q ? activeChannel.color : "#cbd5e1",
                            background:
                              quality === q
                                ? `${activeChannel.color}18`
                                : "transparent",
                            fontWeight: quality === q ? 700 : 400,
                          }}
                        >
                          {q}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Btn onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  )}
                </Btn>
              </div>
            </div>
          )}

          {/* Channel badge */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(8px)",
              padding: "6px 14px",
              borderRadius: "30px",
              border: `1px solid ${activeChannel.color}50`,
              zIndex: 5,
            }}
          >
            <span style={{ fontSize: "16px" }}>{activeChannel.icon}</span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: activeChannel.color,
              }}
            >
              {activeChannel.name}
            </span>
          </div>
        </div>

        {/* Info strip */}
        <div
          style={{
            marginTop: "14px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "13px 18px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: `${activeChannel.color}1e`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              border: `1px solid ${activeChannel.color}40`,
              flexShrink: 0,
            }}
          >
            {activeChannel.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px" }}>
              {activeChannel.name}
            </div>
            <div style={{ fontSize: "12px", color: "#475569" }}>
              {activeChannel.description}
            </div>
          </div>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: `${activeChannel.color}1e`,
              color: activeChannel.color,
              border: `1px solid ${activeChannel.color}40`,
            }}
          >
            {activeChannel.tag}
          </span>
        </div>

        {/* All Channels */}
        <h2
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#334155",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            margin: "28px 0 12px",
          }}
        >
          ALL CHANNELS
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
            gap: "10px",
          }}
        >
          {CHANNELS.map((ch) => (
            <div
              key={ch.id}
              onClick={() => switchChannel(ch)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "13px 15px",
                borderRadius: "12px",
                cursor: "pointer",
                background:
                  activeChannel.id === ch.id
                    ? `linear-gradient(135deg,${ch.color}18,${ch.color}08)`
                    : "rgba(255,255,255,0.03)",
                border:
                  activeChannel.id === ch.id
                    ? `1px solid ${ch.color}50`
                    : "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: `${ch.color}1e`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  border: `1px solid ${ch.color}33`,
                  flexShrink: 0,
                }}
              >
                {ch.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: "11px", color: "#475569" }}>
                  {ch.description}
                </div>
              </div>
              {activeChannel.id === ch.id && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: ch.color,
                    flexShrink: 0,
                    animation: "pulse 1.5s infinite",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: "52px",
          borderTop: "1px solid rgba(99,102,241,0.14)",
          background: "rgba(6,8,20,0.85)",
          padding: "36px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <NavyLogo />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              background: "linear-gradient(90deg,#818cf8,#22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NavyHUB
          </span>
        </div>
        <p
          style={{
            color: "#475569",
            fontSize: "13px",
            maxWidth: "500px",
            margin: "0 auto 14px",
            lineHeight: 1.6,
          }}
        >
          Your premium destination for live cricket, blockbuster movies &amp;
          unlimited entertainment — all in one place.
        </p>
        <p style={{ color: "#334155", fontSize: "12px", marginBottom: "18px" }}>
          🌐 Visit our{" "}
          <strong style={{ color: "#818cf8" }}>official website</strong> for all
          movies &amp; live cricket matches
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <a
            href="https://sixstorm-live.onrender.com"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "9px 22px",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: 600,
              background: "linear-gradient(135deg,#6366f1,#818cf8)",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
            }}
          >
            🔴 sixstorm-live.onrender.com
          </a>
          <a
            href="https://sixstorm-live.vercel.app"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "9px 22px",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: 600,
              background: "linear-gradient(135deg,#0ea5e9,#22d3ee)",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(14,165,233,0.35)",
            }}
          >
            ⚡ sixstorm-live.vercel.app
          </a>
        </div>
        <p style={{ marginTop: "24px", color: "#1e293b", fontSize: "11px" }}>
          © 2026 NavyHUB · Streaming Platform · All Rights Reserved
        </p>
      </footer>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#07080f}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
      `}</style>
    </div>
  );
}

function Btn({ onClick, children, big }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.09)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: big ? "50%" : "8px",
        width: big ? "44px" : "34px",
        height: big ? "44px" : "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.09)")
      }
    >
      {children}
    </button>
  );
}
