import {mokkServer} from './mokkServer';
import {parseOptions} from './parseOptions';

const {port, index, files} = parseOptions();
void mokkServer(port, index, files);
