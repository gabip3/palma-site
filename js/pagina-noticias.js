import { lerForma } from './mancha.js';
import { iniciarTopo } from './topo.js';
import { iniciarNoticias } from './noticias.js';

// o menu nasce da mancha da semente, como nas outras paginas
iniciarTopo({ forma: lerForma('mancha-palma') });
iniciarNoticias();
