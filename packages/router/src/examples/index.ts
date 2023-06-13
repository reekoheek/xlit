import { Router, template } from '../index.js';

const router = new Router(document.getElementById('app') as Element)
  .route('/', template(document.getElementById('home') as HTMLTemplateElement))
  .route('/foo', template(document.getElementById('foo') as HTMLTemplateElement))
  .route('/bar', template(document.getElementById('bar') as HTMLTemplateElement));

router.start();
