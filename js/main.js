// Check if Three.js and its components are loaded
function checkThreeJS() {
    if (!window.THREE) {
        console.error('Three.js not loaded!');
        return false;
    }
    if (!THREE.GLTFLoader) {
        console.error('GLTFLoader not found!');
        return false;
    }
    if (!THREE.OrbitControls) {
        console.error('OrbitControls not found!');
        return false;
    }
    console.log('All Three.js components loaded successfully');
    return true;
}

// Initialize Three.js
function initThreeJS() {
    if (!checkThreeJS()) return;
    
    console.log('Initializing Three.js...');
    
    // Get container and status element
    const container = document.getElementById('model-container');
    const status = document.getElementById('model-status');
    
    if (!container) {
        console.error('Model container not found!');
        return;
    }
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = null;
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    // Setup renderer with proper color management
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    
    // Configure renderer for accurate color reproduction
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Add a neutral white light to ensure visibility without affecting colors
    const light = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(light);
    
    // Clear container and add renderer
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    // Setup fixed camera view - no interaction
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // Disable all controls
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = false;
    
    // Disable all mouse and touch interactions
    controls.mouseButtons = {
        LEFT: null,
        MIDDLE: null,
        RIGHT: null
    };
    controls.touches = {
        ONE: null,
        TWO: null
    };
    
    // Force the camera to look at the center
    camera.lookAt(0, 0, 0);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    // Start animation loop
    animate();
    
    // Load the model
    const modelPath = 'images/robot_playground.glb';
    const loader = new THREE.GLTFLoader();
    
    if (status) status.textContent = 'Loading 3D model...';
    
    loader.load(
        modelPath,
        // onLoad callback
        function(gltf) {
            console.log('Model loaded successfully');
            
            // Clear previous model if any
            while (scene.children.length > 0) {
                const child = scene.children[0];
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
                scene.remove(child);
            }
            
            const model = gltf.scene || gltf.scenes[0];
            
            // Apply color correction to all materials in the model
            model.traverse((node) => {
                if (node.isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach(material => {
                        if (material.map) material.map.encoding = THREE.sRGBEncoding;
                        if (material.emissiveMap) material.emissiveMap.encoding = THREE.sRGBEncoding;
                        if (material.map) material.needsUpdate = true;
                    });
                }
            });
            
            scene.add(model);
            
            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model
            model.position.x = -center.x;
            model.position.y = -center.y;
            model.position.z = -center.z;
            
            // Calculate scale - larger model
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 4.0 / maxDim;
            model.scale.set(scale, scale, scale);
            
            // Position camera - zoomed out a bit more
            const fov = camera.fov * (Math.PI / 180);
            const distance = (Math.max(size.x, size.y, size.z) * 1.2) / (2 * Math.tan(fov / 2));
            camera.position.z = distance * 1.2;
            camera.lookAt(0, 0, 0);
            
            // Setup animations if any
            if (gltf.animations && gltf.animations.length > 0) {
                console.log('Found animations:', gltf.animations.map(a => a.name));
                const mixer = new THREE.AnimationMixer(model);
                
                // Play all animations
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });
                
                function animateModel() {
                    requestAnimationFrame(animateModel);
                    mixer.update(0.016); // 60fps
                }
                
                animateModel();
            } else {
                console.warn('No animations found in the model');
            }
            
            if (status) status.style.display = 'none';
        },
        // onProgress callback
        function(xhr) {
            if (status) {
                const percentComplete = (xhr.loaded / xhr.total * 100).toFixed(2);
                status.textContent = `${percentComplete}% loaded`;
                console.log(percentComplete + '% loaded');
            }
        },
        // onError callback
        function(error) {
            console.error('Error loading model:', error);
            if (status) {
                status.textContent = 'Error loading 3D model';
                status.style.color = '#ff4d4d';
            }
        }
    );
    
    // Handle window resize
    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    // Initial call to set size
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js
    initThreeJS();
    
    // Generate tiny dots for background
    function generateTinyDots() {
        const container = document.getElementById('tiny-dots-container');
        const dotCount = 50; // Number of tiny dots to generate
        
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'tiny-dot';
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Random size between 1px and 3px
            const size = 1 + Math.random() * 2;
            
            // Random animation delay and duration
            const delay = Math.random() * 5;
            const duration = 15 + Math.random() * 20; // 15-35 seconds
            
            // Apply styles
            dot.style.left = `${posX}%`;
            dot.style.top = `${posY}%`;
            dot.style.width = `${size}px`;
            dot.style.height = `${size}px`;
            dot.style.animationDelay = `${delay}s`;
            dot.style.animationDuration = `${duration}s`;
            
            // Random opacity for subtle variation
            dot.style.opacity = 0.05 + Math.random() * 0.1;
            
            container.appendChild(dot);
        }
    }

    // Initialize background elements
    generateTinyDots();

    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    const headerContent = document.querySelector('.header-content');
    let menuToggle = null;

    // Function to close the mobile menu
    function closeMenu() {
        if (menuToggle) {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                nav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }
    }

    // Function to handle menu toggle visibility based on screen size
    function handleMenuToggle() {
        const isMobile = window.innerWidth <= 991; // Match the CSS breakpoint
        const contactLink = document.querySelector('.nav ul li:last-child');
        const headerContent = document.querySelector('.header-content');
        
        // Clean up any existing mobile controls first
        const existingMobileControls = document.querySelector('.mobile-controls');
        if (existingMobileControls) {
            existingMobileControls.remove();
        }
        
        // Remove any existing header-right
        const existingHeaderRight = document.querySelector('.header-right');
        if (existingHeaderRight) {
            existingHeaderRight.remove();
        }
        
        // If we're on mobile
        if (isMobile) {
            // Create container for mobile controls
            const mobileControls = document.createElement('div');
            mobileControls.className = 'mobile-controls';
            
            // Create contact button
            const contactButton = document.createElement('a');
            contactButton.href = 'index.html#contact';
            contactButton.className = 'mobile-contact-btn';
            contactButton.textContent = 'Contact Me';
            contactButton.addEventListener('click', closeMenu);
            
            // Create menu toggle button
            menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.setAttribute('aria-label', 'Toggle menu');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            
            // Append buttons to container
            mobileControls.appendChild(contactButton);
            mobileControls.appendChild(menuToggle);
            
            // Add controls to header
            if (headerContent) {
                const headerRight = document.createElement('div');
                headerRight.className = 'header-right';
                headerRight.appendChild(mobileControls);
                headerContent.appendChild(headerRight);
                
                // Hide the contact link in the mobile menu
                if (contactLink) {
                    contactLink.style.display = 'none';
                }
                
                // Toggle menu on click
                menuToggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    nav.classList.toggle('active', !isExpanded);
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
                    }
                    this.setAttribute('aria-expanded', !isExpanded);
                    document.body.style.overflow = isExpanded ? '' : 'hidden';
                });
                
                // Close menu when clicking outside
                const clickOutsideHandler = (e) => {
                    if (nav.classList.contains('active') && 
                        !e.target.closest('.nav') && 
                        e.target !== menuToggle) {
                        closeMenu();
                    }
                };
                
                // Store the handler for later removal
                document._clickOutsideHandler = clickOutsideHandler;
                document.addEventListener('click', clickOutsideHandler);
                
                // Close menu when clicking a nav link
                document.querySelectorAll('.nav a').forEach(link => {
                    link.addEventListener('click', closeMenu);
                });
                
                // Close menu on escape key
                const escapeKeyHandler = (e) => {
                    if (e.key === 'Escape' && nav.classList.contains('active')) {
                        closeMenu();
                    }
                };
                document._escapeKeyHandler = escapeKeyHandler;
                document.addEventListener('keydown', escapeKeyHandler);
            }
        } 
        // If we're on desktop
        else {
            // Clean up event listeners
            if (document._clickOutsideHandler) {
                document.removeEventListener('click', document._clickOutsideHandler);
                delete document._clickOutsideHandler;
            }
            if (document._escapeKeyHandler) {
                document.removeEventListener('keydown', document._escapeKeyHandler);
                delete document._escapeKeyHandler;
            }
            
            // Show the contact link in the main nav
            if (contactLink) {
                contactLink.style.display = '';
            }
            
            // Reset menu state
            if (menuToggle) {
                menuToggle = null;
            }
        }
    }
    
    // Initialize menu toggle based on initial screen size
    handleMenuToggle();
    
    // Update menu toggle when window is resized
    window.addEventListener('resize', handleMenuToggle);
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', formObject);
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Animate skills on scroll
    const animateSkillsOnScroll = function() {
        const skills = document.querySelectorAll('.skill');
        
        skills.forEach(skill => {
            const skillPosition = skill.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (skillPosition < screenPosition) {
                skill.querySelector('.progress').style.width = skill.querySelector('.progress').style.width;
            }
        });
    };
    
    // Initialize skill animations
    window.addEventListener('scroll', animateSkillsOnScroll);
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
    
    // Add animation to elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.skill-card, .project-card, .about-content, .contact-content');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Initialize animations
    window.addEventListener('scroll', animateOnScroll);
    window.dispatchEvent(new Event('scroll'));
});
