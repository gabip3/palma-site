import { lerForma } from './mancha.js';
import { iniciarHero } from './hero.js';
import { iniciarTopo } from './topo.js';
import { iniciarOrigem } from './origem.js';
import { iniciarProdutos } from './produtos.js';
import { iniciarOnde } from './onde.js';

// o menu nasce da mancha da semente; o Hero le as proprias manchas no HTML
iniciarTopo({ forma: lerForma('mancha-palma') });
iniciarHero();
// depois do Hero: a Secao 02 usa a mancha principal que ele acabou de montar
iniciarOrigem();
iniciarProdutos();
iniciarOnde();
