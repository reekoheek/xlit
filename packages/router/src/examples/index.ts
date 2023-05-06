import { Router, template } from '../';

const router = new Router(document.getElementById('app') as HTMLElement)
  .route('/', template(document.getElementById('home') as HTMLTemplateElement))
  .route('/foo', template(document.getElementById('foo') as HTMLTemplateElement))
  .route('/bar', template(document.getElementById('bar') as HTMLTemplateElement));

router.start();
