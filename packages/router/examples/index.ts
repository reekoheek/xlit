import { Router, template } from '../src';

const router = new Router(document.getElementById('app') as HTMLElement);
router.route('/', template(document.getElementById('home') as HTMLTemplateElement));
router.route('/foo', template(document.getElementById('foo') as HTMLTemplateElement));
router.route('/bar', template(document.getElementById('bar') as HTMLTemplateElement));
