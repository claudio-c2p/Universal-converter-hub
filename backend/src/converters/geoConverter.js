import { DOMParser } from '@xmldom/xmldom';
import * as togeojson from '@tmcw/togeojson';
import tokml from 'tokml';

function parseXml(xmlString) {
  if (typeof xmlString !== 'string' || xmlString.trim().length === 0) {
    throw new Error('Conteúdo XML vazio ou inválido.');
  }
  const errors = [];
  const parser = new DOMParser({
    errorHandler: {
      warning: () => {},
      error:   (msg) => errors.push(msg),
      fatalError: (msg) => errors.push(msg),
    },
  });
  const dom = parser.parseFromString(xmlString, 'text/xml');
  if (errors.length > 0) throw new Error(`XML malformado: ${errors[0]}`);
  return dom;
}

export function kmlToGeojson(kmlString) {
  const dom = parseXml(kmlString);
  const geojson = togeojson.kml(dom);
  if (!geojson.features || geojson.features.length === 0) {
    throw new Error('Nenhuma geometria encontrada no KML. Verifique se o arquivo contém Placemarks.');
  }
  return geojson;
}

export function gpxToGeojson(gpxString) {
  const dom = parseXml(gpxString);
  const geojson = togeojson.gpx(dom);
  if (!geojson.features || geojson.features.length === 0) {
    throw new Error('Nenhum waypoint ou trilha encontrada no GPX.');
  }
  return geojson;
}

export function geojsonToKml(geojsonObject) {
  if (!geojsonObject || typeof geojsonObject !== 'object') {
    throw new Error('GeoJSON inválido.');
  }
  if (!geojsonObject.features || !Array.isArray(geojsonObject.features)) {
    throw new Error('GeoJSON deve conter um array "features".');
  }
  try {
    return tokml(geojsonObject);
  } catch (err) {
    throw new Error(`Falha ao converter GeoJSON para KML: ${err.message}`);
  }
}
