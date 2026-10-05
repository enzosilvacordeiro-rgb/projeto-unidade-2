// Algoritmo calcula_hash da Alura em JavaScript
function calculaHash(texto) {
    let valor = 0;
    for (let i = 0; i < texto.length; i++) {
        valor = (valor * 31 + texto.charCodeAt(i));
        valor = valor % 4294967296; // Limite 32 bits
    }
    const hex = valor.toString(16).padStart(8, '0');
    return `0x${hex}`;
}

// Conjunto de caracteres suportados (Letras minúsculas, maiúsculas e números)
const CARACTERES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Elementos HTML
const senhaAlvoInput = document.getElementById('senha-alvo');
const btnRevelar = document.getElementById('btn-revelar');
const infoHash = document.getElementById('info-hash');
const btnIniciar = document.getElementById('btn-iniciar');

const progressBar = document.getElementById('progress-bar');
const statTentativa = document.getElementById('stat-tentativa');
const statCount = document.getElementById('stat-count');
const statTempo = document.getElementById('stat-tempo');
const resultado = document.getElementById('resultado');

// Atualiza o hash alvo quando a senha muda
senhaAlvoInput.addEventListener('input', () => {
    const senha = senhaAlvoInput.value;
    if (senha.length > 0) {
        infoHash.textContent = `Hash Gerado: ${calculaHash(senha)}`;
    } else {
        infoHash.textContent = "Hash Gerado: -";
    }
});

// Botão para mostrar/ocultar senha
btnRevelar.addEventListener('click', () => {
    senhaAlvoInput.type = senhaAlvoInput.type === 'password' ? 'text' : 'password';
});

// Gera todas as combinações de 1 até o tamanho máximo
function gerarCombinacoes(maxLen) {
    const lista = [];
    
    function recursiva(prefixo, tamanhoAtual) {
        if (prefixo.length === tamanhoAtual) {
            lista.push(prefixo);
            return;
        }
        for (let i = 0; i < CARACTERES.length; i++) {
            recursiva(prefixo + CARACTERES[i], tamanhoAtual);
        }
    }

    for (let len = 1; len <= maxLen; len++) {
        recursiva("", len);
    }
    return lista;
}

// Algoritmo de Força Bruta Assíncrono para renderizar o progresso no navegador
btnIniciar.addEventListener('click', async () => {
    const senhaAlvo = senhaAlvoInput.value;
    
    if (senhaAlvo.length === 0 || senhaAlvo.length > 3) {
        alert("Por favor, digite uma senha de 1 a 3 caracteres!");
        return;
    }

    const hashAlvo = calculaHash(senhaAlvo);
    const tentativas = gerarCombinacoes(3); // Pré-gera as combinações para senhas de até 3 chars
    const totalTentativas = tentativas.length;

    // Reinicia interface
    btnIniciar.disabled = true;
    senhaAlvoInput.disabled = true;
    resultado.classList.add('hidden');
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    const inicioTempo = performance.now();
    let encontrada = null;

    // Executa em pequenos lotes para não congelar a tela/UI
    const BATCH_SIZE = 250; 
    
    for (let i = 0; i < totalTentativas; i++) {
        const tentativa = tentativas[i];
        
        if (calculaHash(tentativa) === hashAlvo) {
            encontrada = tentativa;
            
            // Atualiza status final de 100%
            const tempoDecorrido = ((performance.now() - inicioTempo) / 1000).toFixed(2);
            progressBar.style.width = '100%';
            progressBar.textContent = '100%';
            statTentativa.textContent = tentativa;
            statCount.textContent = `${i + 1} / ${totalTentativas}`;
            statTempo.textContent = `${tempoDecorrido}s`;
            break;
        }

        // Atualiza a tela a cada lote (BATCH_SIZE)
        if (i % BATCH_SIZE === 0 || i === totalTentativas - 1) {
            const progresso = ((i / totalTentativas) * 100).toFixed(1);
            const tempoDecorrido = ((performance.now() - inicioTempo) / 1000).toFixed(2);

            progressBar.style.width = `${progresso}%`;
            progressBar.textContent = `${progresso}%`;
            statTentativa.textContent = tentativa;
            statCount.textContent = `${i + 1} / ${totalTentativas}`;
            statTempo.textContent = `${tempoDecorrido}s`;

            // Permite que o navegador redesenhe os elementos na tela
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    // Exibe o resultado final
    resultado.classList.remove('hidden');
    if (encontrada) {
        resultado.innerHTML = `
            <strong>🎉 SENHA ENCONTRADA COM SUCESSO!</strong><br>
            • Senha Descoberta: <code>"${encontrada}"</code><br>
            • Hash Correspondente: <code>${hashAlvo}</code>
        `;
    }

    btnIniciar.disabled = false;
    senhaAlvoInput.disabled = false;
});
