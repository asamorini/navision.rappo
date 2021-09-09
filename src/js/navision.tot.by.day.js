var rows=jQuery('#listaRigheOdT tr:not(.jqgfirstrow)'),
	ggOld='',
	hoursTot=0,
	previousColHoursTot,
	alternateBackground=true;

rows.each(function(index){
	var row=jQuery(this),
		cols=row.find('td'),
		colHours=cols.filter('[aria-describedby=listaRigheOdT_OreOrdinarie]'),
		hours=+colHours.html().replace(',','.'),
		gg=cols.filter('[aria-describedby=listaRigheOdT_Data]').html(),
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
			totEl=jQuery('<div/>',{'class':'totHours','style':'font-weight:bold;text-align: left;'})
					.appendTo(previousColHoursTot);
		}
		totEl.html('TOT '+(hoursTot+hours));
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
		colHours.css('background','#ffeded');
	}
	previousColHoursTot=cols.filter('[aria-describedby=listaRigheOdT_OreStraordinarie]');
});
