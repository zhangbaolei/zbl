/*!2016-08-12 */
!function(){function a(a){this.message=a}var b="undefined"!=typeof exports?exports:self,c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";a.prototype=new Error,a.prototype.name="InvalidCharacterError",b.encoder||(b.encoder=function(b){for(var d,e,f=String(b),g=0,h=c,i="";f.charAt(0|g)||(h="=",g%1);i+=h.charAt(63&d>>8-g%1*8)){if(e=f.charCodeAt(g+=.75),e>255)throw new a("'encoder' failed: The string to be encoded contains characters outside of the Latin1 range.");d=d<<8|e}return i}),b.decoder||(b.decoder=function(b){var d=String(b).replace(/=+$/,"");if(d.length%4==1)throw new a("'decoder' failed: The string to be decoded is not correctly encoded.");for(var e,f,g=0,h=0,i="";f=d.charAt(h++);~f&&(e=g%4?64*e+f:f,g++%4)?i+=String.fromCharCode(255&e>>(-2*g&6)):0)f=c.indexOf(f);return i})}();