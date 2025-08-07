document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const formContainer = document.querySelector('.form-container');

    // CORRIGIDO: Função para limpar classes de transição e gerenciar altura
    function clearTransitionClasses() {
        formContainer.classList.remove('is-moving-left', 'is-moving-right', 'is-transitioning');
        loginForm.classList.remove('form-exit');
        signupForm.classList.remove('form-exit');
    }

    // NOVO: Função para iniciar transição com mudança de altura
    function startTransition(direction, fromForm, toForm, heightMode) {
        if (formContainer.classList.contains('is-transitioning')) return false;

        clearTransitionClasses();
        formContainer.classList.add(`is-moving-${direction}`, 'is-transitioning');
        
        // Muda a altura do container ANTES da transição do formulário
        formContainer.classList.remove('login-mode', 'signup-mode');
        formContainer.classList.add(heightMode);
        
        // Inicia animação de saída
        fromForm.classList.add('form-exit');
        
        // Troca formulários após animação
        setTimeout(() => {
            fromForm.classList.remove('active', 'form-exit');
            toForm.classList.add('active');
            clearTransitionClasses();
        }, 500);
        
        return true;
    }

    // Event listener para o botão de Login
    loginToggle.addEventListener('click', () => {
        if (!loginToggle.classList.contains('active')) {
            // Usa função unificada para transição
            if (startTransition('left', signupForm, loginForm, 'login-mode')) {
                loginToggle.classList.add('active');
                signupToggle.classList.remove('active');
            }
        }
    });

    // Event listener para o botão de Cadastro
    signupToggle.addEventListener('click', () => {
        if (!signupToggle.classList.contains('active')) {
            // Usa função unificada para transição
            if (startTransition('right', loginForm, signupForm, 'signup-mode')) {
                signupToggle.classList.add('active');
                loginToggle.classList.remove('active');
            }
        }
    });

    // CORRIGIDO: Sistema de loading melhorado para os formulários
    const allForms = [loginForm, signupForm];
    
    allForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const submitButton = form.querySelector('.btn');
            
            // CORRIGIDO: Previne múltiplos submits
            if (submitButton.classList.contains('loading')) return;
            
            // Ativa estado de loading
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            // Simula processamento (substitua pela sua lógica de autenticação)
            setTimeout(() => {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
                
                // EXEMPLO: Aqui você pode adicionar lógica de sucesso/erro
                console.log('Formulário processado:', form.id);
                
                // Exemplo de como você poderia tratar diferentes formulários:
                if (form.id === 'login-form') {
                    handleLogin(new FormData(form));
                } else if (form.id === 'signup-form') {
                    handleSignup(new FormData(form));
                }
                
            }, 2000); // 2 segundos de simulação
        });
    });

    // NOVO: Validação de senhas em tempo real para cadastro
    const signupPassword = document.getElementById('signup-password');
    const signupConfirm = document.getElementById('signup-confirm');
    
    function validatePasswords() {
        if (signupPassword.value && signupConfirm.value) {
            if (signupPassword.value !== signupConfirm.value) {
                signupConfirm.setCustomValidity('As senhas não coincidem');
                signupConfirm.classList.add('error'); // Você pode estilizar isso no CSS
            } else {
                signupConfirm.setCustomValidity('');
                signupConfirm.classList.remove('error');
            }
        }
    }
    
    // Event listeners para validação de senha
    signupPassword.addEventListener('input', validatePasswords);
    signupConfirm.addEventListener('input', validatePasswords);

    // NOVO: Funções auxiliares para processar os formulários
    function handleLogin(formData) {
        const email = formData.get('email') || document.getElementById('login-email').value;
        const password = formData.get('password') || document.getElementById('login-password').value;
        
        console.log('Tentativa de login:', { email, password: '***' });
        
        // Aqui você faria a chamada para sua API de autenticação
        // Exemplo:
        // fetch('/api/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (data.success) {
        //         window.location.href = '/dashboard';
        //     } else {
        //         showError('Credenciais inválidas');
        //     }
        // });
    }
    
    function handleSignup(formData) {
        const name = formData.get('name') || document.getElementById('signup-name').value;
        const email = formData.get('email') || document.getElementById('signup-email').value;
        const password = formData.get('password') || document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        
        // Validação adicional
        if (password !== confirmPassword) {
            console.error('Senhas não coincidem');
            return;
        }
        
        console.log('Tentativa de cadastro:', { name, email, password: '***' });
        
        // Aqui você faria a chamada para sua API de registro
        // Exemplo similar ao login...
    }

    // NOVO: Função para mostrar erros (você pode estilizar isso)
    function showError(message) {
        // Cria ou encontra elemento de erro
        let errorDiv = document.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid rgba(255, 0, 0, 0.3);
                color: #fff;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 20px;
                text-align: center;
                font-size: 14px;
            `;
            formContainer.insertBefore(errorDiv, document.querySelector('.form-toggle'));
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Remove após 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    // NOVO: Melhoria da acessibilidade - navegação por teclado
    document.addEventListener('keydown', (e) => {
        // Permite trocar entre formulários com Alt + L (Login) ou Alt + C (Cadastro)
        if (e.altKey) {
            if (e.key.toLowerCase() === 'l') {
                e.preventDefault();
                loginToggle.click();
            } else if (e.key.toLowerCase() === 'c') {
                e.preventDefault();
                signupToggle.click();
            }
        }
    });

    // NOVO: Auto-foco no primeiro campo quando troca de formulário
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                const firstInput = mutation.target.querySelector('input[type="email"], input[type="text"]');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        });
    });

    // Observa mudanças nos formulários
    observer.observe(loginForm, { attributes: true, attributeFilter: ['class'] });
    observer.observe(signupForm, { attributes: true, attributeFilter: ['class'] });
});

// NOVO: Utilitários exportáveis (caso você queira usar em outros arquivos)
window.LoginFormUtils = {
    // Função para limpar formulários
    clearForms: () => {
        document.querySelectorAll('.form input').forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
    },
    
    // Função para definir dados do formulário programaticamente
    setFormData: (formType, data) => {
        const prefix = formType === 'login' ? 'login' : 'signup';
        Object.keys(data).forEach(key => {
            const input = document.getElementById(`${prefix}-${key}`);
            if (input) {
                input.value = data[key];
                // Dispara evento para ativar label flutuante
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }
};