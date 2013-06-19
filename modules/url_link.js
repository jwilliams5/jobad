JOBAD.modules.register({
  info:{
		'identifier':	'test.url',
		'title':	'Test Module: Mediawiki Link',
		'author':	'Janelle Williams',
		'description':	'Simple link to proof pag from mediawiki',
	},
	contextMenuEntries: function(target){
		if(target.is('#nomenu,#nomenu *')){ //no menu for these elements
			return false;
		}
		/*	var math = target.closest('math');
		if (! math.is('math')) { return false;}
		*/
		return[
		       ["Url Link", function(element){
			       //var link = target.find("a[href]").attr('href');
			       var link = target.closest('a').attr('href');
			       //alert(link.toString());
			       window.location.href = link;
				   //"http://en.wikipedia.org/wiki/Mathematics";
			   }]
		       ];
	}
    });
