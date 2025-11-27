// static/js/modal-content.js
export const MODAL_CONTENTS = {

    // HERO MODALS
    Welcome:{
        title: "WELCOME TO MY VIRTUAL PLAYGROUND!",
        content: `
            <div class="mk-modal-section ">
                <p> Thanks for stopping by!<p>
                <p><strong>Click around and explore my creations and experiments I’ve been working on throughout my coding journey!</strong></p>
                <p>This portfolio was designed to be <strong>fun</strong> and <strong>interactive</strong>!  I've included projects that you can take for a spin yourself rather than listening to me ramble about them in a demo video**</p>   
                <p>You’ll find everything from practical tools to playful side-quests and mezmerizing visual experiments. </p>
                <p> And remember: <strong>It's all about the friends you make along the way!</strong> Niels the cat is here to help guide you through your journey!  If you're more of a solo traveler, just click <strong>'SLEEP'</strong> in the bottom right corner.</p>
            </div>
   
                <div class="mk-modal-section">
                    <p style="text-align: center;"><strong>**If you would like to see some demo videos, check out my Youtube! </strong></p>
                    <p style="text-align: center;">  <a href="https://www.youtube.com/@mkb0020" target="_blank" rel="noopener noreferrer class="btn btn-modal-pulse" class="btn btn-modal-pulse">
                        Let's go!                     
                    </a></p>
                </div>
         `
    },

    AboutSite:{
        title: "ABOUT THIS SITE",
        content: `
            <div class="mk-modal-section ">
                <p class="mk-modal-note-mauve">
                    This site is both my portfolio <em>and</em> part of my portfolio. Using <strong>Python, Flask, 
                    JavaScript, HTML, and CSS</strong>, I built it to showcase my work across coding, 
                    art, and design — blending the technical with the creative.
                </p>
            </div>
            <div class="mk-modal-section">
                <h4>Features:</h4>
                <div class="modal-glass-tiles">
                    <div class="modal-glass-tile">
                        <h4>Coding Projects</h4>
                        <p>Projects inspired by real-life scenarios, practical tools, ineractive dashboards, games, neat things to look at, and anything else my brain cooks up!</p>
                    </div>
                    <div class="modal-glass-tile">
                        <h4>E-Commerce</h4>
                        <p>Storefront experience with demo shopping cart and checkout functionality.</p>
                    </div>
                    <div class="modal-glass-tile">
                        <h4>Resume & Experience</h4>
                        <p>Deep dive into my background and skills</p>
                    </div>
                    <div class="modal-glass-tile">
                        <h4>Contact Forms</h4>
                        <p>Send me a message, submit feedback in my suggestions box, and even request a website or application!</p>
                    </div>
                </div>
            </div>
            <div class="mk-modal-section">
                    <h4>It's a living example of how I combine design, data, and automation to create thoughtful, functional experiences.</h4> 
            </div>
        `


    },

    AboutMe:{
        title: "HELLO WORLD",
        content: `
            <div class="mk-modal-section">
                <p style="text-align: center; font-size: 1.3rem">   
                    I'm MK — a coder, artist, and perpetual creator based in Atlanta, GA
                    <p style="text-align: center; font-size: 2.0rem"> 🍑
                </p>    
            </div>
            <div class="mk-modal-section ">
                <p>I <strong>thrive</strong> on building things — whether it's a web app, a piece of jewelry, or automation that makes life a little easier. I'm passionate about <strong>coding, process improvement, spreadsheets</strong> (yes, really!), and exploring how <strong>AI</strong> can integrate with the human experience.</p>  
                <p>I'm always learning new skills and diving into new challenges, whether that's mastering a framework, experimenting with a fresh creative idea, or going down an internet rabbit-hole about random topics that pique my interest. </p>
                <p> When I need to give my brain a break, I can often be found doing yoga or hula hooping up and down Atlanta's Betline!
            </div>

        `


    },


    // RESUME MODALS
    Highlights: {
        title: "What I bring to the table",
        content: `
            <div class="modal-glass-tiles">
                <div class="modal-glass-tile">
                    <h4>Subscription and XaaS Operations</h4>
                    <p>Practical lifecycle management for Cisco portfolios across distributor and VAR channels.</p>
                </div>
                <div class="modal-glass-tile">
                    <h4> Cross Functional Collaboration </h4>
                    <p>Extensive experience partnering with Sales, IT, Finance, Engineering, distributors, OEMs, and end customers</p>
                </div>
                <div class="modal-glass-tile">
                    <h4>Pre Sales Technical Support</h4>
                    <p>Quoting, deal registration, RFQ response, and partner enablement for complex technical programs</p>
                </div>
                <div class="modal-glass-tile">
                    <h4>Customer Lifecycle Management and Leadership</h4>
                    <p> Renewals, onboarding, true ups, and leading enablement efforts for internal teams and external partners</p>
                </div>

                <div class="modal-glass-tile">
                    <h4> Automation & Data Work</h4>
                    <p>self taught coding projects to build data analysis tools and prototype ML models for forecasting and risk detection / Web Development and hobbyist game development projects for creative practice and rapid prototyping</p>
                </div>
                
                <div class="modal-glass-tile">
                    <h4>Training and Enablement</h4>
                    <p>Designed internal / partner-facing self serve guides and recurring trainings that enable others to succeed</p>
                </div>                
            </div>
        `
    },

    Education: {
        title: "Education",
        content: `
            <div class="modal-glass-tiles">
                <div class="modal-glass-tile-auburn">
                    <p style="text-align: center;">
                        <img src="/static/images/Aubie.gif" alt="War Eagle!" class="aubie-img">
                    </p>
                    <p style="text-align: center;"><h4>Auburn University</h4></p>
                    <h5>Bachelor of Science: Industrial and Systems Engineering</h5>
                    <p style="text-align: center;">2011 – 2015</p>
                </div>
            </div>
        `
    },

    Certificates: {
        title: "Certificates",
        content: `
            <div class="modal-glass-tiles">
                <div class="modal-glass-tile">
                    <h4>Cisco CX Stage 1</h4>
                    <p> Distributors Badge</p>
                </div>
                <div class="modal-glass-tile">
                    <h4>Cisco Black Belt</h4>
                    <p> Cloud Operations Stage 1</p>
                </div>
                <div class="modal-glass-tile">
                    <h4>Cisco Black Belt</h4>
                    <p>Distribution Success Stage 1</p>
                </div>
                <div class="modal-glass-tile">
                    <h4>D&H LEAN Change Agent</h4>
                    <p>Green Belt</p>
                </div>
            </div>
        `
    },

    Skills: {
        title: "Skills & Capabilities",
        content: `
            <div class="modal-holographic-grid">
                <div class="modal-holographic-card">
                    <h4>Operations & Process</h4>
                    <ul>
                        <li>Process Development, Documentation, and Improvement</li>
                        <li>Operational Process Improvement</li>
                        <li>Cross-Functional Ops</li>
                        <li>Enablement & Training</li>
                        <li>Customer Experience Lifecycle Management</li>
                    </ul>
                </div>
                <div class="modal-holographic-card">
                    <h4>Technical Skills</h4>
                    <ul>
                        <li>Python (pandas, Matplotlib, scikit-learn, tkinter, numpy, seaborn)</li>
                        <li>Visual Basic (Microsoft Excel)</li>
                        <li>Web Development (Python, Flask, Javascript, Bootstrap, HTML, CSS)</li>
                        <li>API Integration</li>
                        <li>PostgreSQL</li>
                        <li>Web Dev (HTML/CSS/JS)</li>
                    </ul>
                </div>
                <div class="modal-holographic-card">
                    <h4>Data & Analytics</h4>
                    <ul>
                        <li>Data Analysis & Visualization</li>
                        <li>Subscription Management (Renewals, Modifications, True-Ups)</li>
                        <li>Cisco Enterprise Agreement Support and Management</li>
                    </ul>
                </div>

                <div class="modal-holographic-card">
                    <h4>Tools & Platforms</h4>
                    <ul>
                        <li>Cisco Channel Sales Tools: CCW, PXP, DPV, Smart Accounts, Software Central, DevNet</li>
                        <li>SEWP V/GSA workflows</li>
                        <li>Microsoft Office Suite, CRM, ERP, and channel quoting tools</li>
                    </ul>
                </div>
            </div>
        `
    },

    Cisco: {
        title: "Senior Specialist",
        content: `
            <h4>Cisco SMARTnet and Subscriptions </h4>
            <div class="mk-modal-note-mauve">
                <h4> D&H Distributing</h4>
                <br> 📍 Harrisburg, PA
                <br> 📅 August 2022 - June 2025
            </div>
            <div class="mk-modal-section ">
                <h4>Key Responsibilities:</h4>
                <div class="mk-modal-list">
                <ul>
                    <li>Managed full Cisco subscription lifecycle, including onboarding, upsells, renewals, term changes, and True Forward/Value Shift events.</li>
                    <li>Led partner-facing support and internal training across government, military, corporate, and healthcare accounts.</li>
                    <li>Supported API integration of Cisco quoting tools by collaborating with IT and translating Cisco concepts into actionable technical requirements using DevNet resources.</li>
                    <li>Authored self-serve enablement guides and delivered internal training to Sales, Operations, and Engineering teams.</li>
                    <li>Contributed to LEAN-driven improvements to streamline quoting and lifecycle support across departments.</li>
                </ul>
                </div>
            </div>
        `
    },

    SCW: {
        title: "Account Manager",
        content: `
            <h4>Corporate / Healthcare </h4>    
            <div class="mk-modal-note-mauve">
                <h4> Southen Computer Warehouse</h4>
                <br> 📍 Marietta, GA
                <br> 📅 March 2016 - August 2022
            </div>
            <div class="mk-modal-section ">
                <h4>Key Responsibilities:</h4>
                <div class="mk-modal-list">
                <ul>
                    <li>Managed long-term sales relationships with corporate and healthcare clients across the U.S., driving consistent account growth.</li>
                    <li>Assessed customer IT environments to identify technology gaps and opportunities, coordinating with distribution and OEM partners to build proposals.</li>
                    <li>Provided ongoing product knowledge and procurement guidance, positioning tailored solutions to meet business needs.</li>
                </ul>
                </div>
            </div>
        `
    },



        // ============================ DEMO ADMIN DASHBOARD
    DemoMessages: {
        title: "💬 Message",
        content: `
             <div class="submission-message" id="contactMessage"></div>
        `
    },   

    DemoInfoModal:{
        title: "Congratulations!",
        content: `
             </p><div class="mk-modal-note-aqua">Your local coffee shop, <strong>Shrodinger's Cat Cafe</strong>, has become so sucessful that you opened an online store (<strong>"Toe Beans"</strong>) to sell your <strong>PURRfect</strong> coffee beans by the bag!
                    <br><br> <strong>Welcome to your dashboard where you can manage orders, messages, and the store's Suggestions Box! </strong></div></p>
                </p>
                <div class="mk-modal-section">
                    <p><div class="modal-glass-tile">
                        <h4>✨ What You Can Do</h4>
                            <ul class="modal-list">
                                <li><strong>Search Orders</strong> - Search by order number or customer email to find specific orders instantly.</li>
                                <li><strong>Track Shipments</strong> - Add tracking numbers and select carriers (USPS, FedEx, UPS).</li>
                                <li><strong>Update Statuses</strong> - Change order statuses: Pending → Processing → Shipped → Completed.</li>
                                <li><strong>Filter Orders</strong> - View orders by status to focus on what needs attention.</li>
                                <li><strong>Manage Contacts</strong> - View contact submissions and mark them as read/unread.</li>
                                <li><strong>Review Suggestions</strong> - See customer feedback and suggestions organized by type</li>
                            </ul>
                    </div></p>
                </div>
                <div class="mk-modal-section">
                    <p><div class="modal-glass-tile">
                        <h4> How It Works:</h4>
                            <ul class="modal-list">
                                <li><strong>All data is fake</strong> - Generated with fictional names, addresses, and order details. Please do not call any of the phone numbers as they were randomly generated and could belong to actual humans!!</li>
                                <li><strong>Changes persist during your session</strong> - Update statuses and they'll stay until you refresh.</li>
                                <li><strong>Click "Reset Demo"</strong> to generate new data and start fresh.</li>
                                <li><strong>No database needed</strong> - Everything runs in your browser session.</li>
                                <li><strong>Fully interactive</strong> - Every button and feature works just like the real admin dashboard!</li>
                            </ul>
                    </div></p>
                </div>
                <div class="mk-modal-section">
                    <p><div class="modal-glass-tile">
                        <strong>Security Note:</strong> This is a <strong>demonstration version</strong> for portfolio purposes. The real admin dashboard 
                        requires password authentication and connects to a secure database. No actual customer data is 
                        accessible through this demo.
                    </div></p>
                </div>
                <div class="mk-modal-section">
                    <p><div class="modal-glass-tile">
                        <h4>Get Started:</h4> 
                        <ul class="modal-list">
                            <li>Click any <strong>"Try It Out!"</strong> button above to explore different sections.</li>
                            <li>In the Orders dashboard, try <strong>searching</strong> for "Paul" or "ORD-202".</li>
                            <li>Click a status button to <strong>update an order</strong> and watch it change.</li>
                            <li>Add a <strong>tracking number</strong> like "123456789" and select a carrier.</li>
                            <li>Use the <strong>filter buttons</strong> to view orders by status.</li>
                        </ul>
                    </div></p>
                </div>
                
            
            
        `
    },   

        // ============================
    
    AIgame:{
        title: "'Social' Experiment",
        content: `
            <div class="mk-modal-section ">
                <p> I am absolutely facinated by LLM's! I love talking with them about any and every topic from physics to philosohy to cookie recipies to social issues to how to replace my car's tail light - you name it! </p>
                <p> This page is a game that I played with Chat GPT and Grok: </p>
                    <ul>
                        <li>I started off by asking Grok to come up with an off-the-wall question for Chat GPT</li>
                        <li>Grok provided a question that I passed along and asked Chat GPT to respond and to ask Grok a follow up question.</li>
                        <li>Chat GPT replied and I passed it back to Grok and repeat.</li>
                    </ul>
            </div>
         `
    },
    
    
    
    
    
    manifold: {
        title: "A Calabi-What?",
        content: `
            <p class="modal-note-aqua">FILL IN LATER</p>
            <p>FILL IN LATER</p>
            <ul class="modal-list">
                <li>FILL IN LATER</li>
                <li>FILL IN LATER</li>
            </ul>

            <table class="mk-modal-table-fun">
                <thead><tr><th>Type</th><th>Formula</th><th>Traits</th></tr></thead>
                <tbody>
                    <tr><td>Mandelbrot</td><td>z² + c</td><td>Iconic bug shape</td></tr>
                    <tr><td>Burning Ship</td><td>(|Re| + i|Im|)² + c</td><td>Flame-like</td></tr>
                </tbody>
            </table>
        `
    },

    fractal: {
        title: "WHAT IS A FRACTAL?",
        content: `
            <p class="mk-modal-note-mauve">FILL IN LATER</p>
            
            <div class="mk-modal-section">
                <h3>Key Properties</h3>
                <ul class="mk-modal-list">
                    <li>FILL IN LATER</li>
                    <li>FILL IN LATER</li>
                </ul>
            </div>

            <table class="mk-modal-table">
                <thead><tr><th>Type</th><th>Formula</th><th>Traits</th></tr></thead>
                <tbody>
                    <tr><td>Mandelbrot</td><td>z² + c</td><td>Iconic bug shape</td></tr>
                    <tr><td>Burning Ship</td><td>(|Re| + i|Im|)² + c</td><td>Flame-like</td></tr>
                </tbody>
            </table>
        `
    },

    catLore: {
        title: "CAT BACK STORIES",
        content: `
            <div class="modal-glass-tiles">
                <div class="modal-glass-tile"><img src="nona.jpg"><h4>NONA</h4><p>FILL IN LATER</p></div>
                <div class="modal-glass-tile"><img src="gato.jpg"><h4>GATO</h4><p>FILL IN LATER</p></div>
            </div>
        `
    },


};