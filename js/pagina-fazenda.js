import { lerForma } from './mancha.js';
import { iniciarTopo } from './topo.js';
import { iniciarFazenda } from './fazenda.js';

// o menu nasce da mancha da semente, como na Home
iniciarTopo({ forma: lerForma('mancha-palma') });
iniciarFazenda();
