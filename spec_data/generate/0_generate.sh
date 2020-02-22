#!/bin/sh

MYDIR='.'
OUTDIR='../data/ds_a'
mkdir -p $OUTDIR
echo "MYDIR= ($MYDIR), OUTDIR=($OUTDIR)"
rm -Rf $OUTDIR/x_*
node $MYDIR/cruces.js > $OUTDIR/x_cruces.tsv.00
node $MYDIR/altura.js > $OUTDIR/x_alturas.tsv.00
node $MYDIR/elementos.js > $OUTDIR/x_elementos.tsv.00
node $MYDIR/areas.js > $OUTDIR/x_test_areas.tsv.00
node $MYDIR/xy_cercanos.js
node $MYDIR/zip.js
zip -r $OUTDIR/x_zip.zip $OUTDIR/x_zip
split -C 100000 -d $OUTDIR/area_vtx_all.tsv $OUTDIR/x_area. 
ls -lh $OUTDIR
