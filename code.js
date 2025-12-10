const buttons = document.querySelectorAll('.fusion-button');

buttons.forEach(button => {
	button.addEventListener('click', function(event) {
	const buttonText = button.textContent.trim();
	if (!buttonText.includes("Learn More") && !buttonText.includes("get it now")) {
		event.preventDefault();
		
		let price;

		const priceMatch = buttonText.match(/\$\d+(\.\d{2})?/); 
		if (priceMatch) {
			price = priceMatch[0];
		} else {
			const priceElement = button.closest('.fusion-layout-column').querySelector('h5[data-fontsize]');
			if (priceElement) {
				price = priceElement.textContent.trim();
			} else {
				const bookPriceElement = button.closest('.fusion-text').querySelector('.book_price strong');
				if (bookPriceElement) {
					price = bookPriceElement.textContent.trim();
				}
			}
		}

		if (buttonText.includes("Purchase")) {
			const digitalPriceElement = document.querySelector('.book_price strong');
			if (digitalPriceElement) {
				price = digitalPriceElement.textContent.trim();
			}
		}
		
		if (price) {
			document.cookie = "_price="+price;
		}
		
		(function openPageCloneWithAllScripts() {
		  const secondPageHtml = '<!DOCTYPE html><html class="thrivecart-html builder-v2-content">[...]</html>';

		  const modalHtml = `[...]`;
		  
		  const originalScripts = Array.from(document.querySelectorAll('script'));
			  const docClone = document.documentElement.cloneNode(true);
			  Array.from(docClone.querySelectorAll('script')).forEach(s => s.remove());
			  if (docClone.body) {
				const container = document.createElement('div');
				container.innerHTML = modalHtml;
				while (container.firstChild) docClone.body.appendChild(container.firstChild);
				docClone.body.style.overflow = 'hidden';
				docClone.body.style.paddingRight = '0';
			  } else {
				const wrapper = document.createElement('div');
				wrapper.innerHTML = modalHtml;
				docClone.appendChild(wrapper);
			  }

			  const NEW_TAB_NAME = 'sharp_thrivecart_clone';
			  const newTab = window.open('', NEW_TAB_NAME);
			  if (!newTab) { return; }
			  newTab.document.open();
			  newTab.document.write('<!DOCTYPE html>\n' + docClone.outerHTML);
			  newTab.document.close();

			  function whenDomReady(targetWin, cb) {
				try {
				  const td = targetWin.document;
				  if (!td) return setTimeout(() => whenDomReady(targetWin, cb), 50);
				  if (td.readyState === 'complete' || td.readyState === 'interactive') return cb();
				  td.addEventListener('DOMContentLoaded', function handler() {
					td.removeEventListener('DOMContentLoaded', handler);
					cb();
				  });
				  setTimeout(() => {
					if (td.readyState === 'complete' || td.readyState === 'interactive') cb();
				  }, 200);
				} catch (e) {
				  setTimeout(cb, 200);
				}
			  }
			  
				async function injectScripts(targetDoc, scripts) {
				  const blockingPatterns = [
					'Blocked window.open in cloned tab',
					'window.open = function',
					'window.__originalOpen',
					'window.open.*block',
					'return null.*window.open'
				  ];
				  
				  const injectedGuardIds = [];
				  
				  for (const s of scripts) {
					try {
					  let shouldSkip = false;
					  
					  if (!s.src && s.textContent) {
						const scriptContent = s.textContent;
						for (const pattern of blockingPatterns) {
						  if (scriptContent.includes(pattern)) {
							shouldSkip = true;
							break;
						  }
						}
						
						if (scriptContent.includes('guard inserted by opener') || 
							scriptContent.includes('window.name = "' + NEW_TAB_NAME + '"')) {
							shouldSkip = true;
							break;
						}
					  }
					  
					  if (s.src) {
						const blockList = [
						  
						];
						
						for (const blockedUrl of blockList) {
						  if (s.src.includes(blockedUrl)) {
							shouldSkip = true;
							break;
						  }
						}
					  }
					  
					  if (shouldSkip) {
						continue;
					  }
					  
					  const newS = targetDoc.createElement('script');
					  for (let i = 0; i < s.attributes.length; i++) {
						const attr = s.attributes[i];
						if (/^on/i.test(attr.name)) continue;
						newS.setAttribute(attr.name, attr.value);
					  }
					  
					  if (s.src) {
						newS.src = s.src;
						const isAsync = s.hasAttribute('async');
						if (isAsync) {
						  (targetDoc.body || targetDoc.head || targetDoc.documentElement).appendChild(newS);
						} else {
						  await new Promise(resolve => {
							newS.onload = () => resolve();
							newS.onerror = () => { console.warn('Не удалось загрузить скрипт:', s.src); resolve(); };
							(targetDoc.body || targetDoc.head || targetDoc.documentElement).appendChild(newS);
						  });
						}
					  } else {
						newS.textContent = s.textContent;
						(targetDoc.body || targetDoc.head || targetDoc.documentElement).appendChild(newS);
					  }
					} catch (err) {
					  console.error('Ошибка в injectScripts:', err);
					}
				  }
				}
										  

				whenDomReady(newTab, () => {
					try {
						const guardCode = `
						/* guard inserted by opener */
						try {
						  window.name = ${JSON.stringify(NEW_TAB_NAME)};
						  window.__isClone = true;
						  (function(){
							// Проверяем, не была ли уже установлена блокировка
							if (!window.__isBlocked) {
							  const originalOpen = window.open;
							  window.open = function(url, name, specs) {
								const stack = new Error().stack;
								if (stack && (stack.includes('clickSavedButton') || stack.includes('ButtonSelectorTracker'))) {
								  return originalOpen.call(window, url, name, specs);
								}
								return null;
							  };
							  window.__originalOpen = originalOpen;
							  window.__isBlocked = true;
							}
						  })();
						} catch(e) { /*ignore*/ }
					`;
				
					const guardScript = newTab.document.createElement('script');
					guardScript.textContent = guardCode;
					const head = newTab.document.head || newTab.document.getElementsByTagName('head')[0];
					if (head) head.appendChild(guardScript); else newTab.document.body.appendChild(guardScript);
					
					const pushCode = `
					try {
					  history.pushState({}, "2025", "/sharpfootballanalysis/thrivecart");
					  //document.cookie = "title=";
					  document.title = document.querySelector('title').textContent;
					 document.cookie = "title=2025, " + document.title;
					} catch (e) {
					  console.warn('pushState failed in new tab:', e);
					}
					`;

					const pushScript = newTab.document.createElement('script');
					pushScript.textContent = pushCode;
					const head2 = newTab.document.head || newTab.document.getElementsByTagName('head')[0];
					if (head2) head2.appendChild(pushScript); else newTab.document.body.appendChild(pushScript);

					injectScripts(newTab.document, originalScripts).then(() => {
						/*ignore*/
					}).catch(err => console.error('injectScripts failed:', err));
					} catch (err) {
						/*ignore*/
					}
				});

			})();
		}
	});
});

цена для "Purchase (Digital)" находится здесь:
<h3 style="text-align: center; --fontSize: 22; line-height: 1.2; --minFontSize: 22;" data-fontsize="22" data-lineheight="26.4px" class="fusion-responsive-typography-calculated"><span style="color: #ffffff;">$34.99</span></h3>
