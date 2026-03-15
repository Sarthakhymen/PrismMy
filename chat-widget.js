// ================================
// PRISM AI Assistant — Chat Widget
// ================================
(function () {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');

        /* Floating Button */
        .prism-chat-fab {
            position: fixed; bottom: 28px; right: 28px; z-index: 9999;
            width: 72px; height: 72px; border-radius: 20px;
            background: linear-gradient(135deg, #818cf8, #38bdf8);
            border: 4px solid rgba(255,255,255,0.7); cursor: pointer; 
            box-shadow: 0 12px 40px rgba(129, 140, 248, 0.3), inset 0 2px 0 rgba(255,255,255,0.2);
            display: flex; align-items: center; justify-content: center;
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: fabBounce 4s ease-in-out infinite;
            font-size: 2.2rem;
        }
        .prism-chat-fab:hover { transform: scale(1.15) rotate(-5deg); box-shadow: 0 16px 50px rgba(129, 140, 248, 0.4); }
        .prism-chat-fab.open { transform: rotate(360deg) scale(0.9); }
        @keyframes fabBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        /* Notification badge */
        .prism-chat-badge {
            position: absolute; top: -10px; right: -10px;
            width: 24px; height: 24px; border-radius: 50%;
            background: #ffffff; color: #000000; font-size: 0.8rem;
            font-weight: 800; display: flex; align-items: center; justify-content: center;
            border: 3px solid #0d0d14; animation: badgePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes badgePop { 0% { transform: scale(0); } 100% { transform: scale(1); } }

        /* Chat Window */
        .prism-chat-window {
            position: fixed; bottom: 115px; right: 28px; z-index: 9998;
            width: 420px; max-height: 600px; border-radius: 32px;
            background: #ffffff; border: 2px solid #e2e8f0;
            box-shadow: 0 30px 100px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05);
            display: flex; flex-direction: column; overflow: hidden;
            opacity: 0; transform: translateY(30px) scale(0.9);
            pointer-events: none; transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Inter', sans-serif;
        }
        .prism-chat-window.visible {
            opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
        }

        /* Header */
        .pcw-header {
            padding: 24px; display: flex; align-items: center; gap: 16px;
            border-bottom: 2px solid #e2e8f0;
            background: #f8fafc;
        }
        .pcw-avatar {
            width: 52px; height: 52px; border-radius: 16px;
            background: linear-gradient(135deg, #818cf8, #38bdf8);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.8rem; flex-shrink: 0; 
            box-shadow: 0 8px 20px rgba(129, 140, 248, 0.2);
        }
        .pcw-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.2rem; color: #1e293b; letter-spacing: -0.01em; }
        .pcw-subtitle { font-size: 0.85rem; color: #64748b; display: flex; align-items: center; gap: 8px; font-weight: 600; }
        .pcw-online { width: 10px; height: 10px; border-radius: 50%; background: #34d399; box-shadow: 0 0 10px #34d399; animation: onlinePulse 2s infinite; }
        @keyframes onlinePulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.6; } }
        .pcw-close { margin-left: auto; background: none; border: none; cursor: pointer; color: #64748b; padding: 8px; border-radius: 12px; transition: all 0.3s; }
        .pcw-close:hover { color: #1e293b; background: rgba(0,0,0,0.05); transform: rotate(90deg); }

        /* Messages */
        .pcw-messages {
            flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px;
            min-height: 320px; max-height: 380px; scroll-behavior: smooth;
        }
        .pcw-messages::-webkit-scrollbar { width: 6px; }
        .pcw-messages::-webkit-scrollbar-track { background: transparent; }
        .pcw-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 6px; }

        .pcw-msg { max-width: 88%; animation: msgSlide 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes msgSlide { from { opacity: 0; transform: translateY(20px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .pcw-msg.bot { align-self: flex-start; }
        .pcw-msg.user { align-self: flex-end; }

        .pcw-msg .bubble {
            padding: 16px 20px; border-radius: 20px; font-size: 0.92rem; line-height: 1.7; font-weight: 500;
        }
        .pcw-msg.bot .bubble {
            background: #f1f5f9; border: 1px solid #e2e8f0;
            color: #1e293b; border-bottom-left-radius: 4px;
        }
        .pcw-msg.user .bubble {
            background: linear-gradient(135deg, #818cf8, #38bdf8);
            color: #ffffff; border-bottom-right-radius: 4px;
            box-shadow: 0 4px 15px rgba(129, 140, 248, 0.2);
        }
        .pcw-msg .meta { font-size: 0.75rem; color: #94a3b8; margin-top: 8px; padding: 0 6px; font-weight: 600; }
        .pcw-msg.user .meta { text-align: right; }

        /* Typing indicator */
        .pcw-typing { display: flex; gap: 6px; padding: 16px 20px; align-items: center; }
        .pcw-typing span {
            width: 10px; height: 10px; border-radius: 50%; background: #38bdf8;
            animation: typingJump 1.4s infinite;
        }
        .pcw-typing span:nth-child(2) { animation-delay: 0.2s; }
        .pcw-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingJump { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-10px); opacity: 1; } }

        /* Quick replies */
        .pcw-quick-replies { display: flex; flex-wrap: wrap; gap: 10px; padding: 0 24px 16px; }
        .pcw-qr {
            padding: 10px 18px; border-radius: 24px; font-size: 0.85rem; font-weight: 600;
            background: #f1f5f9; border: 1px solid #e2e8f0;
            color: #64748b; cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pcw-qr:hover { background: #e0e7ff; border-color: #818cf8; color: #818cf8; transform: translateY(-3px) scale(1.05); }

        /* Input area */
        .pcw-input-area {
            padding: 18px 24px; border-top: 2px solid #e2e8f0;
            display: flex; gap: 12px; align-items: center;
            background: #ffffff;
        }
        .pcw-input {
            flex: 1; padding: 14px 20px; border-radius: 18px; border: 2px solid #e2e8f0;
            background: #f8fafc; color: #1e293b; font-family: 'Inter', sans-serif;
            font-size: 0.95rem; outline: none; transition: all 0.3s;
        }
        .pcw-input::placeholder { color: #94a3b8; }
        .pcw-input:focus { border-color: #818cf8; background: #ffffff; }
        .pcw-send {
            width: 52px; height: 52px; border-radius: 16px; border: none;
            background: linear-gradient(135deg, #818cf8, #38bdf8); cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); flex-shrink: 0;
            box-shadow: 0 8px 15px rgba(129, 140, 248, 0.2);
        }
        .pcw-send:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 12px 20px rgba(129, 140, 248, 0.3); }
        .pcw-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .pcw-send svg { width: 24px; height: 24px; fill: #ffffff; }

        @media (max-width: 480px) {
            .prism-chat-window { width: calc(100vw - 24px); right: 12px; bottom: 100px; max-height: 75vh; }
            .prism-chat-fab { bottom: 16px; right: 16px; width: 64px; height: 64px; }
        }
    `;
    document.head.appendChild(style);

    // Knowledge base
    const KB = {
        greetings: [
            "Hey! 👋 I'm PRISM AI — your friendly neurodevelopment assistant. How can I help you today?",
            "Hi there! 🧠 I'm here to help with anything about PRISM, our cognitive games, or neurodivergent conditions. Ask away!",
        ],
        topics: {
            adhd: {
                keywords: ['adhd', 'attention deficit', 'hyperactivity', 'focus', 'concentration', 'distracted', 'impulsive', 'inattention'],
                response: "**ADHD (Attention-Deficit/Hyperactivity Disorder)** affects ~8-10% of children globally.\n\n🧠 **Key Signs:**\n• Difficulty sustaining attention\n• Easily distracted\n• Impulsive responses\n• Trouble following instructions\n\n🎮 **Our Games for ADHD:**\n• 🎯 **Attention Check** — measures sustained focus\n• 🚦 **Stop Signal** — tests impulse control (gold standard)\n• 🧩 **Memory Matrix** — assesses working memory\n\n💡 **Tip:** Play all three ADHD-related games for a comprehensive attention profile!"
            },
            autism: {
                keywords: ['autism', 'asd', 'spectrum', 'social', 'emotion', 'empathy', 'facial expression', 'communication'],
                response: "**Autism Spectrum Disorder (ASD)** affects ~1 in 36 children.\n\n🧠 **Key Indicators:**\n• Difficulty reading facial expressions\n• Challenges with social cues\n• Differences in motor imitation\n• Unique sensory processing\n\n🎮 **Our Games for ASD:**\n• 😊 **Emotion Lab** — tests emotion recognition\n• 🏃 **Motor Match** — measures motor coordination (CAMI-based, 80% accuracy)\n\n💡 **Tip:** Emotion Lab tracks which emotions are hardest to identify — this data helps specialists!"
            },
            dyslexia: {
                keywords: ['dyslexia', 'reading', 'writing', 'letters', 'mirror', 'phonological', 'spelling', 'auditory'],
                response: "**Dyslexia** affects ~15-20% of the population — it's more common than you think!\n\n🧠 **Key Indicators:**\n• Letter/number reversals (b/d, p/q)\n• Difficulty with phonological processing\n• Slow reading speed\n• Auditory processing challenges\n\n🎮 **Our Games for Dyslexia:**\n• 🧭 **Direction Sense** — detects mirror confusion\n• 🎵 **Sound Pattern** — tests auditory/phonological processing\n\n💡 **Tip:** Early detection is crucial! 80% of dyslexia cases can be detected through gamified screening (NIH study)."
            },
            cerebralpalsy: {
                keywords: ['cerebral palsy', 'motor', 'coordination', 'movement', 'fine motor', 'gross motor', 'cp'],
                response: "**Cerebral Palsy** affects motor function and coordination.\n\n🧠 **Key Areas:**\n• Fine motor control challenges\n• Hand-eye coordination\n• Motor planning difficulties\n\n🎮 **Our Game for CP:**\n• 🏃 **Motor Match** — measures click precision, drag accuracy, and motor planning\n\n💡 **Tip:** Regular play sessions (2-3 times/week) can show measurable improvement in motor coordination!"
            },
            games: {
                keywords: ['games', 'play', 'which game', 'what games', 'how many games', 'all games', 'game list'],
                response: "We have **7 scientifically-designed games**! 🎮\n\n1. 🎯 **Attention Check** — ADHD (sustained focus)\n2. 😊 **Emotion Lab** — Autism (emotion recognition)\n3. 🧭 **Direction Sense** — Dyslexia (spatial awareness)\n4. 🧩 **Memory Matrix** — ADHD+Autism (working memory)\n5. 🎵 **Sound Pattern** — Dyslexia+ADHD (auditory processing)\n6. 🏃 **Motor Match** — CP+Autism (motor coordination)\n7. 🚦 **Stop Signal** — ADHD (impulse control)\n\nEach takes 2-5 minutes. I recommend playing all 7 for a complete cognitive profile! 📊"
            },
            dashboard: {
                keywords: ['dashboard', 'results', 'score', 'report', 'analysis', 'risk', 'profile'],
                response: "📊 **The PRISM Dashboard** aggregates results from all 7 games into one report!\n\n**It shows:**\n• Overall Cognitive Health Score (0-100)\n• 7-domain bar chart (Attention, Emotion, Spatial, Memory, Auditory, Motor, Impulse)\n• Individual game result cards\n• Risk assessment per domain\n• 🧠 AI-powered recommendations\n• 🖨️ Printable report for therapists\n\n**Your data is stored locally** — it's only on your device. Play more games to improve your profile accuracy!"
            },
            howworks: {
                keywords: ['how does it work', 'how it works', 'science', 'evidence', 'research', 'clinical', 'validated'],
                response: "🔬 **PRISM is based on published clinical research:**\n\n• **Stop Signal Task** — validated by CHADD.org for ADHD diagnosis\n• **CAMI (Motor Imitation)** — 80% autism detection (Kennedy Krieger Institute)\n• **Gamified Dyslexia Screening** — 80%+ detection rate (NIH study)\n• **Working Memory Training** — improves prefrontal cortex activation (fMRI studies)\n• **EndeavorRx Model** — FDA-approved game-based ADHD treatment\n\n⚠️ Remember: PRISM is a **screening tool**, not a clinical diagnosis. Always consult a healthcare professional for formal assessment!"
            },
            tips: {
                keywords: ['tips', 'improve', 'help', 'better', 'practice', 'therapy', 'train', 'exercise'],
                response: "💡 **Tips to Improve Cognitive Performance:**\n\n**For Attention (ADHD):**\n• Practice 10-min focused activities daily\n• Use timers for tasks\n• Regular physical exercise\n• Mindfulness & breathing exercises\n\n**For Emotions (ASD):**\n• Storytelling with emotion cards\n• Role-play social scenarios\n• Discuss feelings during daily activities\n\n**For Reading (Dyslexia):**\n• Musical/rhythm activities\n• Phonics-based games\n• Multi-sensory reading (touch + see + hear)\n\n**For Motor Skills (CP):**\n• Play-Doh & clay activities\n• Drawing & tracing exercises\n• Building blocks & puzzles"
            },
            parents: {
                keywords: ['parent', 'child', 'my kid', 'my son', 'my daughter', 'worried', 'concerned', 'suspect'],
                response: "🤗 **For Parents — You're Not Alone!**\n\nNeurodivergence affects 15-20% of children globally. Early detection makes a huge difference!\n\n**What you can do:**\n1. 🎮 Have your child play all 7 PRISM games\n2. 📊 Review the dashboard results together\n3. 🖨️ Print the report for your pediatrician\n4. 🗓️ Re-assess every 2-4 weeks to track progress\n5. 💬 Share results with your child's teacher\n\n**Remember:** A screening flag doesn't mean a diagnosis. It means \"let's look closer\" — and that's always a good thing! ❤️"
            },
        },
        fallback: [
            "That's a great question! 🤔 I can help with information about **ADHD, Autism, Dyslexia, Cerebral Palsy**, our **7 games**, the **dashboard**, or **tips for improvement**. What would you like to know?",
            "I'm not sure about that one! Try asking me about our games, neurodivergent conditions, or how to interpret results. I'm here to help! 💡",
        ]
    };

    function getResults() {
        const games = ['attention', 'emotion', 'direction', 'memory', 'sound', 'motor', 'stopsignal'];
        const results = {};
        let count = 0;
        games.forEach(g => {
            const data = JSON.parse(localStorage.getItem(`prism_${g}_results`) || 'null');
            if (data) { results[g] = data; count++; }
        });
        return { results, count };
    }

    function getResultsSummary() {
        const { results, count } = getResults();
        if (count === 0) return "You haven't played any games yet! 🎮 Start with **Attention Check** to get your first assessment.";

        let summary = `📊 **Your PRISM Profile** (${count}/7 games played):\n\n`;
        if (results.attention) summary += `• 🎯 Attention: Score ${results.attention.score}, ${results.attention.accuracy}% accuracy, Risk: ${results.attention.riskScore}%\n`;
        if (results.emotion) summary += `• 😊 Emotion: Score ${results.emotion.score}, ${results.emotion.accuracy}% accuracy, Risk: ${results.emotion.riskScore}%\n`;
        if (results.direction) summary += `• 🧭 Direction: Score ${results.direction.score}, ${results.direction.accuracy}% accuracy, Risk: ${results.direction.riskScore}%\n`;
        if (results.memory) summary += `• 🧩 Memory: Max Span ${results.memory.maxSpan}, ${results.memory.accuracy}% accuracy, Risk: ${results.memory.riskScore}%\n`;
        if (results.sound) summary += `• 🎵 Sound: Max Seq ${results.sound.maxSeq}, ${results.sound.accuracy}% accuracy, Risk: ${results.sound.riskScore}%\n`;
        if (results.motor) summary += `• 🏃 Motor: Precision ${results.motor.precision}%, Risk: ${results.motor.riskScore}%\n`;
        if (results.stopsignal) summary += `• 🚦 Stop Signal: Go ${results.stopsignal.goAcc}%, Stop ${results.stopsignal.stopAcc}%, Risk: ${results.stopsignal.riskScore}%\n`;

        const risks = Object.values(results).map(r => r.riskScore).filter(Boolean);
        const avgRisk = risks.length ? Math.round(risks.reduce((a, b) => a + b, 0) / risks.length) : 0;
        summary += `\n**Overall Risk: ${avgRisk}%** — ${avgRisk < 30 ? '✅ Low risk' : avgRisk < 60 ? '⚠️ Moderate' : '🔴 Higher risk, consider professional assessment'}`;
        if (count < 7) summary += `\n\n💡 Play ${7 - count} more game(s) for a complete profile!`;
        return summary;
    }

    function matchTopic(text) {
        const lower = text.toLowerCase();

        // Check for results request
        if (/my (result|score|report|profile|data)|show.*result|how did i/i.test(lower)) {
            return getResultsSummary();
        }

        // Match topics
        for (const [, topic] of Object.entries(KB.topics)) {
            if (topic.keywords.some(kw => lower.includes(kw))) {
                return topic.response;
            }
        }

        // Greeting
        if (/^(hi|hello|hey|sup|yo|hola|namaste|hii+)/i.test(lower.trim())) {
            return KB.greetings[Math.floor(Math.random() * KB.greetings.length)];
        }

        // Thanks
        if (/thank|thanks|thx|dhanyavad|shukriya/i.test(lower)) {
            return "You're welcome! 😊 Feel free to ask anything else about PRISM. Happy screening! 🧠✨";
        }

        return KB.fallback[Math.floor(Math.random() * KB.fallback.length)];
    }

    function formatMsg(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '&nbsp;&nbsp;• ');
    }

    function timeStr() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Build DOM
    const fab = document.createElement('button');
    fab.className = 'prism-chat-fab';
    fab.innerHTML = `
        <span id="prismFabIcon">🤖</span>
        <div class="prism-chat-badge">1</div>
    `;

    const win = document.createElement('div');
    win.className = 'prism-chat-window';
    win.innerHTML = `
        <div class="pcw-header">
            <div class="pcw-avatar">🤖</div>
            <div>
                <div class="pcw-title">PRISMy Robot</div>
                <div class="pcw-subtitle"><span class="pcw-online"></span> Ready to help!</div>
            </div>
            <button class="pcw-close" title="Close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="pcw-messages" id="pcwMessages"></div>
        <div class="pcw-quick-replies" id="pcwQuickReplies"></div>
        <div class="pcw-input-area">
            <input class="pcw-input" id="pcwInput" placeholder="Ask PRISMy anything..." autocomplete="off" />
            <button class="pcw-send" id="pcwSend" title="Send">
                <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
            </button>
        </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(win);

    let isOpen = false;
    const msgArea = win.querySelector('#pcwMessages');
    const input = win.querySelector('#pcwInput');
    const sendBtn = win.querySelector('#pcwSend');
    const qrArea = win.querySelector('#pcwQuickReplies');
    const closeBtn = win.querySelector('.pcw-close');

    function toggle() {
        isOpen = !isOpen;
        win.classList.toggle('visible', isOpen);
        fab.classList.toggle('open', isOpen);
        const badge = fab.querySelector('.prism-chat-badge');
        if (badge) badge.remove();
        if (isOpen) {
            fab.innerHTML = `✕`;
            fab.style.fontSize = '1.5rem';
            fab.style.fontWeight = '800';
            input.focus();
        } else {
            fab.innerHTML = `🤖`;
            fab.style.fontSize = '2.2rem';
        }
    }

    fab.onclick = toggle;
    closeBtn.onclick = toggle;

    function addMsg(text, isUser = false) {
        const div = document.createElement('div');
        div.className = `pcw-msg ${isUser ? 'user' : 'bot'}`;
        div.innerHTML = `
            <div class="bubble">${formatMsg(text)}</div>
            <div class="meta">${isUser ? 'You' : '🧠 PRISM AI'} · ${timeStr()}</div>
        `;
        msgArea.appendChild(div);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'pcw-msg bot';
        div.id = 'pcwTyping';
        div.innerHTML = `<div class="bubble pcw-typing"><span></span><span></span><span></span></div>`;
        msgArea.appendChild(div);
        msgArea.scrollTop = msgArea.scrollHeight;
    }
    function hideTyping() {
        const t = document.getElementById('pcwTyping');
        if (t) t.remove();
    }

    function showQuickReplies(replies) {
        qrArea.innerHTML = replies.map(r => `<button class="pcw-qr">${r}</button>`).join('');
        qrArea.querySelectorAll('.pcw-qr').forEach(btn => {
            btn.onclick = () => { sendMessage(btn.textContent); qrArea.innerHTML = ''; };
        });
    }

    function sendMessage(text) {
        if (!text.trim()) return;
        addMsg(text, true);
        input.value = '';
        qrArea.innerHTML = '';

        showTyping();
        const delay = 500 + Math.random() * 800;
        setTimeout(() => {
            hideTyping();
            const reply = matchTopic(text);
            addMsg(reply);

            // Smart follow-up suggestions
            const lower = text.toLowerCase();
            if (/adhd|attention|focus/i.test(lower)) {
                showQuickReplies(['🎯 Play Attention Check', '🚦 Play Stop Signal', '💡 Tips for ADHD']);
            } else if (/autism|emotion|social/i.test(lower)) {
                showQuickReplies(['😊 Play Emotion Lab', '🏃 Play Motor Match', '💡 Tips for ASD']);
            } else if (/dyslexia|reading|mirror/i.test(lower)) {
                showQuickReplies(['🧭 Play Direction Sense', '🎵 Play Sound Pattern', '💡 Tips for Dyslexia']);
            } else if (/result|score|profile/i.test(lower)) {
                showQuickReplies(['📊 View Dashboard', '🎮 Play All Games', '🧠 How it works']);
            } else {
                showQuickReplies(['🎮 All Games', '📊 My Results', '💡 Tips', '🧠 How it works']);
            }
        }, delay);
    }

    sendBtn.onclick = () => sendMessage(input.value);
    input.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(input.value); };

    // Handle quick reply navigation
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('pcw-qr')) {
            const text = e.target.textContent;
            if (text.includes('Play Attention')) window.location.href = 'games/attention.html';
            else if (text.includes('Play Stop')) window.location.href = 'games/stopsignal.html';
            else if (text.includes('Play Emotion')) window.location.href = 'games/emotion.html';
            else if (text.includes('Play Motor')) window.location.href = 'games/motor.html';
            else if (text.includes('Play Direction')) window.location.href = 'games/direction.html';
            else if (text.includes('Play Sound')) window.location.href = 'games/sound.html';
            else if (text.includes('View Dashboard')) window.location.href = 'dashboard.html';
        }
    });

    // Welcome message
    setTimeout(() => {
        const { count } = getResults();
        let welcome = "Hey! 👋 I'm **PRISMy** 🤖, your cognitive health assistant.\n\nI can help you with:\n• 🧠 Information about **ADHD, Autism, Dyslexia**\n• 🎮 Our **7 screening games**\n• 📊 Understanding your **results**\n• 💡 **Tips** to improve performance\n\nWhat would you like to know?";
        if (count > 0) {
            welcome = `Welcome back! 👋 I'm **PRISMy** 🤖. You've completed **${count}/7** assessments!\n\nI can **analyze your results**, suggest games, or answer questions about neurodivergent conditions.\n\nWhat would you like to know?`;
        }
        addMsg(welcome);
        showQuickReplies(['🎮 All Games', '📊 My Results', '🧠 What is ADHD?', '💡 Tips']);
    }, 500);
})();
