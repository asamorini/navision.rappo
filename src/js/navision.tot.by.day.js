var rows=jQuery('#listaRigheOdT tr:not(.jqgfirstrow)'),
	ggOld='',
	hoursTot=0,
	previousColHoursTot,
	alternateBackground=true;

rows.each(function(index){
	var row=jQuery(this),
		cols=row.find('td'),
	    	colDay=cols.filter('[aria-describedby=listaRigheOdT_Data]'),
		colHours=cols.filter('[aria-describedby=listaRigheOdT_OreOrdinarie]'),
		gg=colDay.html(),
		hours=+colHours.html().replace(',','.'),
		isLastRow=rows.length==index+1,
		totEl;
		
	//AGGIORNAMENTO RIGHE PRECEDENTI
	if ((gg!==ggOld && ggOld) || isLastRow){
		//aggiorno il totale ore precedente
		if (isLastRow){
			previousColHoursTot=cols.filter('[aria-describedby=listaRigheOdT_OreStraordinarie]');
		}
		totEl=previousColHoursTot.find('.totHours');
		if (!totEl.length){
			totEl=jQuery('<div/>',{'class':'totHours','style':'font-weight:bold;font-size:16px;text-align: left;'})
					.appendTo(previousColHoursTot);
		}
		totEl.html(isLastRow ? hoursTot+hours : hoursTot);
	}
	
	//IDENTIFICAZIONE RIGA ATTUALE
	if (gg===ggOld){
		hoursTot+=hours;

	}else{
		ggOld=gg;
		hoursTot=hours;	//conteggio nuovo totale ore
		alternateBackground=!alternateBackground;
	}
	if (alternateBackground){
		colHours
		.add(colDay)
		.css('background','#ffeded');
	}
	previousColHoursTot=cols.filter('[aria-describedby=listaRigheOdT_OreStraordinarie]');
});
