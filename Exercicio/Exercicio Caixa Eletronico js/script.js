// Caixa Eletrônico simples em JavaScript
(function(){
	'use strict';

	// DOM elementos
	const saldoEl = document.getElementById('saldo');
	const inputDeposito = document.getElementById('valor-deposito');
	const inputSaque = document.getElementById('valor-saque');
	const btnDepositar = document.getElementById('btn-depositar');
	const btnSacar = document.getElementById('btn-sacar');
	const btnConsultar = document.getElementById('btn-consultar');
	const btnReset = document.getElementById('btn-reset');
	const mensagemEl = document.getElementById('mensagem');
	const historicoList = document.getElementById('historico-list');

	// Estado
	let saldo = 0;
	let historico = [];

	// Persistência simples (localStorage)
	function carregarEstado(){
		try{
			const s = localStorage.getItem('caixa_saldo');
			const h = localStorage.getItem('caixa_historico');
			saldo = s ? Number(s) : 0;
			historico = h ? JSON.parse(h) : [];
		}catch(e){
			saldo = 0; historico = [];
		}
	}

	function salvarEstado(){
		localStorage.setItem('caixa_saldo', String(saldo));
		localStorage.setItem('caixa_historico', JSON.stringify(historico));
	}

	// Utilitários
	function formatar(valor){
		return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function exibirMensagem(texto, erro){
		mensagemEl.textContent = texto || '';
		mensagemEl.style.color = erro ? '#b22222' : '#0b704d';
		if(texto){
			setTimeout(()=>{ mensagemEl.textContent = ''; }, 3500);
		}
	}

	function atualizarUI(){
		saldoEl.textContent = formatar(saldo);
		// histórico
		historicoList.innerHTML = '';
		if(historico.length === 0){
			historicoList.innerHTML = '<div class="small">Nenhuma transação ainda.</div>';
			return;
		}
		historico.slice().reverse().forEach(item => {
			const div = document.createElement('div');
			div.className = 'history-item';
			div.innerHTML = `<strong>${item.tipo}</strong> — ${formatar(item.valor)} <span class="small">(${item.data})</span>`;
			historicoList.appendChild(div);
		});
	}

	// Operações
	function depositar(valor){
		if(!isFinite(valor) || valor <= 0){
			exibirMensagem('Informe um valor positivo para depósito.', true);
			return false;
		}
		saldo += valor;
		historico.push({ tipo: 'Depósito', valor: valor, data: new Date().toLocaleString() });
		salvarEstado();
		atualizarUI();
		exibirMensagem('Depósito realizado com sucesso.');
		return true;
	}

	function sacar(valor){
		if(!isFinite(valor) || valor <= 0){
			exibirMensagem('Informe um valor positivo para saque.', true);
			return false;
		}
		if(valor > saldo){
			exibirMensagem('Saldo insuficiente para esse saque.', true);
			return false;
		}
		saldo -= valor;
		historico.push({ tipo: 'Saque', valor: valor, data: new Date().toLocaleString() });
		salvarEstado();
		atualizarUI();
		exibirMensagem('Saque realizado com sucesso.');
		return true;
	}

	function resetConta(){
		if(!confirm('Deseja realmente zerar o saldo e o histórico?')) return;
		saldo = 0; historico = [];
		salvarEstado();
		atualizarUI();
		exibirMensagem('Conta resetada.');
	}

	// Eventos
	document.addEventListener('DOMContentLoaded', ()=>{
		carregarEstado();
		atualizarUI();

		btnDepositar.addEventListener('click', ()=>{
			const v = parseFloat(inputDeposito.value.replace(',', '.')) || 0;
			if(depositar(v)) inputDeposito.value = '';
		});

		btnSacar.addEventListener('click', ()=>{
			const v = parseFloat(inputSaque.value.replace(',', '.')) || 0;
			if(sacar(v)) inputSaque.value = '';
		});

		btnConsultar.addEventListener('click', ()=>{
			exibirMensagem(`Seu saldo é ${formatar(saldo)}.`);
		});

		btnReset.addEventListener('click', resetConta);

		// atalho: Enter nas caixas realiza a ação correspondente
		inputDeposito.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') btnDepositar.click(); });
		inputSaque.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') btnSacar.click(); });
	});

})();

