import { useCallback, useEffect, useRef } from "react";
import "./App.css";

const EMAIL = "pansaresoham10@gmail.com";

function App() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const plasmaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard?.writeText?.(EMAIL);
    const toast = toastRef.current;
    if (!toast) return;

    toast.classList.add("show");
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }, []);

  useEffect(() => {
    const cur = cursorRef.current;
    const ring = ringRef.current;
    if (!cur || !ring) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let hovering = false;
    let ringRafId = 0;

    const updateCursor = () => {
      const scale = hovering ? 2 : 1;
      cur.style.transform = `translate(${mx - 5}px, ${my - 5}px) scale(${scale})`;
    };

    const handleMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      updateCursor();
    };

    const animateRing = () => {
      rx += (mx - rx - 18) * 0.12;
      ry += (my - ry - 18) * 0.12;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      ringRafId = window.requestAnimationFrame(animateRing);
    };

    const hoverTargets = Array.from(
      document.querySelectorAll(
        "a, button, .email-box, .project-card, .skill-cat",
      ),
    );

    const handleEnter = () => {
      hovering = true;
      updateCursor();
      ring.style.width = "56px";
      ring.style.height = "56px";
      ring.style.marginLeft = "-10px";
      ring.style.marginTop = "-10px";
    };

    const handleLeave = () => {
      hovering = false;
      updateCursor();
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.marginLeft = "0";
      ring.style.marginTop = "0";
    };

    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    document.addEventListener("mousemove", handleMove);
    ringRafId = window.requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      hoverTargets.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
      window.cancelAnimationFrame(ringRafId);
    };
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let pts: {
      x: number;
      y: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
    }[] = [];
    let frameId = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const initPts = () => {
      pts = [];
      const cols = Math.floor(W / 80);
      const rows = Math.floor(H / 80);
      for (let c = 0; c <= cols; c += 1) {
        for (let r = 0; r <= rows; r += 1) {
          pts.push({
            x: c * 80,
            y: r * 80,
            ox: c * 80,
            oy: r * 80,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.x - p.ox) > 20) p.vx *= -1;
        if (Math.abs(p.y - p.oy) > 20) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(184,255,61,0.25)";
        ctx.fill();
      });
      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    initPts();
    draw();

    const handleResize = () => {
      resize();
      initPts();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = plasmaCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CHARS = "  ·,.:;-~=+*!?%$#@";
    const FS = 13;
    let W = 0;
    let H = 0;
    let COLS = 0;
    let ROWS = 0;
    let t = 0;
    let frameId = 0;
    let running = true;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      COLS = Math.floor(W / FS);
      ROWS = Math.floor(H / FS);
    };

    const plasmaVal = (col: number, row: number, time: number) => {
      const cx = COLS / 2;
      const cy = ROWS / 2;
      const dx = col - cx;
      const dy = row - cy;
      return (
        Math.sin(col * 0.28 + time) +
        Math.sin(row * 0.2 + time * 0.85) +
        Math.sin(col * 0.22 + row * 0.18 + time * 0.65) +
        Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.22 + time * 0.55)
      );
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.font = `${FS}px "IBM Plex Mono",monospace`;
      ctx.textBaseline = "top";

      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col < COLS; col += 1) {
          const raw = plasmaVal(col, row, t);
          const n = (raw + 4) / 8;
          const ci = Math.floor(n * (CHARS.length - 1));
          const char = CHARS[ci];
          if (char === " ") continue;

          const r = Math.round(184 + (92 - 184) * n);
          const g = Math.round(255 + (225 - 255) * n);
          const b = Math.round(61 + (255 - 61) * n);
          const a = 0.1 + n * 0.8;

          ctx.shadowColor = `rgba(${r},${g},${b},${a * 0.55})`;
          ctx.shadowBlur = n > 0.72 ? 7 : 2;
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fillText(char, col * FS, row * FS);
        }
      }

      t += 0.022;
      frameId = window.requestAnimationFrame(draw);
    };

    const start = () => {
      resize();
      draw();
    };

    const fontReady = document.fonts?.ready;
    if (fontReady) {
      fontReady.then(() => {
        if (!running) return;
        start();
      });
    } else {
      start();
    }

    window.addEventListener("resize", resize);

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div id="cursor" ref={cursorRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>
      <div id="toast" ref={toastRef}>
        ✓ Copied to clipboard
      </div>
      <canvas id="bg-canvas" ref={bgCanvasRef}></canvas>

      <nav id="nav" ref={navRef}>
        <a className="nav-logo" href="#">
          SP<span>_</span>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#skills">Skills</a>
          </li>
          <li>
            <a href="#projects">Projects</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </nav>

      <section id="hero">
        <div className="plasma-wrap">
          <canvas id="plasma-canvas" ref={plasmaCanvasRef}></canvas>
        </div>

        <div className="hero-inner">
          <div className="hero-eyebrow">Available for opportunities</div>
          <h1 className="hero-name">
            <span className="line1">SOHAM</span>
            <span className="line2">
              <span className="accent-char">PANSARE</span>
            </span>
          </h1>
          <p className="hero-desc">
            AI &amp; Data Science student· Building full-stack platforms,
            predictive systems, and indie games as Infindev. I ship things.
          </p>
          <div className="hero-ctas">
            <a href="#projects" className="btn-primary">
              View Projects
            </a>
            <a href="#contact" className="btn-secondary">
              Get in Touch
            </a>
            <a href={`${import.meta.env.BASE_URL}Resume.pdf`} download className="btn-secondary">
              Download Resume
            </a>
          </div>
        </div>

        <div className="hero-scroll">
          <div className="scroll-line"></div>
          scroll
        </div>
      </section>

      <section id="about">
        <div className="container">
          <div className="about-grid reveal">
            <div className="about-text">
              <div className="section-label">01 / About</div>
              <h2 className="section-title">
                Builder by
                <br />
                instinct.
              </h2>
              <p>
                I&apos;m a second-year student persuing Engineering in{" "}
                <em>AI &amp; Data Science</em>. My approach is project-first, I
                learn by building things, breaking them, and shipping fixes.
              </p>
              <p>
                My stack spans frontend to infrastructure: <em>React/Vite</em>{" "}
                dashboards, <em>FastAPI</em> microservices,
                <em>MongoDB Atlas</em>, and LLM API integrations. On weekends I
                ship 2D games under the handle <em>Infindev</em>.
              </p>
              <p>
                Currently deepening expertise in full-stack architecture, RAG
                pipelines, and Docker/CI-CD deployments, with a capstone SaaS
                project on the horizon.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <div className="stat-num">3+</div>
                  <div className="stat-label">Projects Shipped</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">2+</div>
                  <div className="stat-label">Hackathons</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">5+</div>
                  <div className="stat-label">Indie Games</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">∞</div>
                  <div className="stat-label">Things to Build</div>
                </div>
              </div>
            </div>
            <div>
              <div className="terminal-card">
                <div className="terminal-header">
                  <div className="t-dot td-red"></div>
                  <div className="t-dot td-yellow"></div>
                  <div className="t-dot td-green"></div>
                  <div className="terminal-title">whoami.sh</div>
                </div>
                <div className="terminal-body">
                  <div>
                    <span className="t-prompt">~$ </span>
                    <span className="t-cmd">cat profile.json</span>
                  </div>
                  <div className="t-out">{"{"}</div>
                  <div className="t-out">
                    &nbsp; "name": <span>&quot;Soham Pansare&quot;</span>,
                  </div>
                  <div className="t-out">
                    &nbsp; &quot;role&quot;:{" "}
                    <span>&quot;Full-Stack + AI Dev&quot;</span>,
                  </div>
                  <div className="t-out">
                    &nbsp; &quot;domain&quot;:{" "}
                    <span>&quot;AI &amp; Data Science&quot;</span>,
                  </div>
                  <div className="t-out">
                    &nbsp; &quot;gameHandle&quot;:{" "}
                    <span>&quot;Infindev&quot;</span>,
                  </div>
                  <div className="t-out">
                    &nbsp; &quot;status&quot;: <span>&quot;Building&quot;</span>
                  </div>
                  <div className="t-out">{"\u007d"}</div>
                  <br />
                  <div>
                    <span className="t-prompt">~$ </span>
                    <span className="t-cmd">echo $LOCATION</span>
                  </div>
                  <div className="t-out">
                    <span>Mumbai, Maharashtra, IN</span>
                  </div>
                  <br />
                  <div>
                    <span className="t-prompt">~$ </span>
                    <span className="t-cursor"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills">
        <div className="container">
          <div className="reveal">
            <div className="section-label">02 / Skills</div>
            <h2 className="section-title">Technical Arsenal</h2>
          </div>
          <div className="skills-grid reveal">
            <div className="skill-cat">
              <div className="skill-cat-icon">[ 01 ] Frontend</div>
              <div className="skill-cat-name">Interface Layer</div>
              <div className="skill-tags">
                <div className="skill-tag">React / Vite</div>
                <div className="skill-tag">JavaScript (ES6+)</div>
                <div className="skill-tag">Tailwind CSS</div>
                <div className="skill-tag">Leaflet.js</div>
                <div className="skill-tag">Recharts</div>
              </div>
            </div>
            <div className="skill-cat">
              <div className="skill-cat-icon">[ 02 ] Backend</div>
              <div className="skill-cat-name">Server &amp; Data</div>
              <div className="skill-tags">
                <div className="skill-tag">FastAPI (Python)</div>
                <div className="skill-tag">Node.js</div>
                <div className="skill-tag">MongoDB Atlas</div>
                <div className="skill-tag">REST APIs</div>
                <div className="skill-tag">PostgreSQL</div>
              </div>
            </div>
            <div className="skill-cat">
              <div className="skill-cat-icon">[ 03 ] AI &amp; ML</div>
              <div className="skill-cat-name">Intelligence Layer</div>
              <div className="skill-tags">
                <div className="skill-tag">Gemini / OpenAI API</div>
                <div className="skill-tag">LLM Integration</div>
                <div className="skill-tag">Predictive Analytics</div>
                <div className="skill-tag">ML from Scratch</div>
                <div className="skill-tag">RAG Pipelines</div>
              </div>
            </div>
            <div className="skill-cat">
              <div className="skill-cat-icon">[ 04 ] Game Dev</div>
              <div className="skill-cat-name">Infindev Studio</div>
              <div className="skill-tags">
                <div className="skill-tag">Godot Engine 4</div>
                <div className="skill-tag">GDScript</div>
                <div className="skill-tag">2D Physics</div>
                <div className="skill-tag">Shaders</div>
                <div className="skill-tag">itch.io Publishing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects">
        <div className="container">
          <div className="reveal">
            <div className="section-label">03 / Projects</div>
            <h2 className="section-title">Featured Work</h2>
          </div>
          <div className="projects-grid reveal">
            <div className="project-card">
              <div className="project-num">PROJECT_001</div>
              <div className="project-name">RoadPulse</div>
              <p className="project-desc">
                Crowdsourced road quality monitoring system. Android app
                collects IMU sensor data in the background via Godot +
                foreground service. Dual FastAPI microservices process and score
                anomalies. React/Vite dashboard visualises heatmaps with
                Leaflet.
              </p>
              <div className="project-tags">
                <span className="ptag">FastAPI</span>
                <span className="ptag">Godot / GDScript</span>
                <span className="ptag">MongoDB Atlas</span>
                <span className="ptag">React + Vite</span>
                <span className="ptag">Leaflet.js</span>
              </div>
            </div>
            <div className="project-card">
              <div className="project-num">PROJECT_002</div>
              <div className="project-name">RakshakAI</div>
              <p className="project-desc">
                Smart crime mapping and predictive policing platform. Ingests
                incident data, runs Gemini API analysis for pattern detection,
                and renders geospatial heatmaps with drill-down stats on a
                FastAPI + Leaflet.js stack.
              </p>
              <div className="project-tags">
                <span className="ptag">FastAPI</span>
                <span className="ptag">Gemini API</span>
                <span className="ptag">Leaflet.js</span>
                <span className="ptag">Predictive ML</span>
              </div>
              <a
                href="https://rakshak-ai-bay.vercel.app/"
                className="project-link"
              >
                View Project
              </a>
            </div>
            <div className="project-card">
              <div className="project-num">PROJECT_003</div>
              <div className="project-name">NeuralOps</div>
              <p className="project-desc">
                Datadog of the AI agent era a unified observability and control
                platform that gives operations teams full visibility into every
                agent decision, cost, and error in real time.
              </p>
              <div className="project-tags">
                <span className="ptag">OpenAI Codex</span>
                <span className="ptag">Agentic AI</span>
                <span className="ptag">Hackathon Build</span>
              </div>
              <a
                href="https://github.com/Surajphirke3/Codex_hackthon"
                className="project-link"
              >
                View Project
              </a>
            </div>
            <div className="project-card">
              <div className="project-num">PROJECT_004</div>
              <div className="project-name">Infindev Games</div>
              <p className="project-desc">
                Indie game studio publishing 2D action prototypes on itch.io.
                Features robust state-machine character controllers, procedural
                animations, complex enemy AI behaviours, and physics-driven
                interactions in Godot 4.
              </p>
              <div className="project-tags">
                <span className="ptag">Godot Engine 4</span>
                <span className="ptag">GDScript</span>
                <span className="ptag">2D Physics</span>
                <span className="ptag">itch.io</span>
              </div>
              <a href="https://infindev.itch.io" className="project-link">
                Play Games
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="extra">
        <div className="container">
          <div className="extra-grid reveal">
            <div className="extra-card">
              <div className="extra-badge">Hackathon · 2025</div>
              <h3>OpenAI Codex Community Hackathon</h3>
              <p>
                Built NeuralOps with teammates, an agentic AI operations
                assistant. Competed internationally against hundreds of
                developers over a tight weekend sprint using the Codex API.
              </p>
            </div>
            <div className="extra-card">
              <div
                className="extra-badge"
                style={{
                  color: "var(--accent3)",
                  borderColor: "rgba(92, 225, 255, 0.3)",
                }}
              >
                Upcoming · Technical Head
              </div>
              <h3>Startup Venture</h3>
              <p>
                Architecting and owning the full backend infrastructure, API
                design, database schema, and server-side logic. Planning a
                backend migration from Express.js to FastAPI for improved
                scalability and performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="container">
          <div className="contact-inner reveal">
            <div className="section-label">04 / Contact</div>
            <h2 className="contact-headline">
              Let&apos;s build
              <br />
              <span className="hollow">something.</span>
            </h2>
            <p className="contact-sub">
              Open to internships, collaborations, and interesting problems.
              Whether it&apos;s full-stack architecture, AI integrations, or
              game jams, I&apos;m interested.
            </p>
            <div className="email-box" onClick={handleCopyEmail}>
              <span>{EMAIL}</span>
              <span className="email-copy-icon">[ copy ]</span>
            </div>
            <div className="social-row">
              <a href={`${import.meta.env.BASE_URL}Resume.pdf`} download className="social-link">
                Resume
              </a>
              <a href="https://infindev.itch.io" className="social-link">
                itch.io
              </a>
              <a href="https://github.com/Infindev7" className="social-link">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/soham-pansare-118978293/" className="social-link">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <span>
          © 2026 <a href="#">Soham Pansare</a>. Built with React &amp; care.
        </span>
        <span>AI &amp; Data Science · Infindev</span>
      </footer>
    </>
  );
}

export default App;
