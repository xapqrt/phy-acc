const ModeManager = {
    currentMode: null,
    modeModules: {
        'coulomb': CoulombMode,
        'rf': RFMode,
        'scope': ScopeMode,
        'tokamak': TokamakMode
    },
    
    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode') || 'coulomb';
        
        this.setMode(mode);
    },
    
    setMode(modeName) {
        document.getElementById('coulombSliders').style.display = 'none';
        document.getElementById('rfSliders').style.display = 'none';
        document.getElementById('scopeSliders').style.display = 'none';
        document.getElementById('tokamakSliders').style.display = 'none';
        
        this.currentMode = this.modeModules[modeName];
        window.currentMode = modeName;
        
        if (!this.currentMode) {
            console.error('unknown mode: ' + modeName);
            return;
        }
        
        const sliderMap = {
            'coulomb': 'coulombSliders',
            'rf': 'rfSliders',
            'scope': 'scopeSliders',
            'tokamak': 'tokamakSliders'
        };
        
        const slidersId = sliderMap[modeName];
        if (slidersId) {
            document.getElementById(slidersId).style.display = 'block';
        }
        
        if (this.currentMode.init) {
            this.currentMode.init(window.canvas);
        }
        
        if (this.currentMode.setupSliders) {
            this.currentMode.setupSliders();
        }
        
        if (typeof showInstruction === 'function') {
            setTimeout(() => {
                showInstruction(modeName);
            }, 500);
        }
    },
    
    handleClick(e, canvas) {
        if (this.currentMode && this.currentMode.handleClick) {
            this.currentMode.handleClick(e, canvas);
        }
    },
    
    update(canvas) {
        if (this.currentMode && this.currentMode.update) {
            this.currentMode.update(canvas);
        }
    },
    
    draw(ctx, canvas) {
        if (this.currentMode && this.currentMode.draw) {
            this.currentMode.draw(ctx, canvas);
        }
    },
    
    clear() {
        if (this.currentMode && this.currentMode.clear) {
            this.currentMode.clear();
        }
    }
};
