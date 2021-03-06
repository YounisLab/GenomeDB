import _ from 'lodash'

export function createCurveSeries(sample, data, color) {
  return {
    name: `${sample.toUpperCase()} distribution`,
    type: 'line',
    data: data,
    color: color,
    marker: {
      enabled: false
    }
  }
}

export function createVerticalSeries(sample, data, color) {
  return {
    name: `${sample}`,
    type: 'line',
    data: data,
    color: color,
    pointWidth: 5,
    dashStyle: 'Dash'
  }
}

export function createHeatMapSeries(data, samples, dataKey, isSampleOnXAxis) {
  const series = []
  _.each(samples, function (sample, sampleIndex) {
    _.each(data, function (datum, datumIndex) {
      const xIndex = isSampleOnXAxis ? sampleIndex : datumIndex
      const yIndex = isSampleOnXAxis ? datumIndex : sampleIndex

      // Heatmap data schema [x-index, y-index, gradient value]
      series.push([xIndex, yIndex, datum[dataKey(sample)]])
    })
  })

  return series
}

// data should look like [[0,0, 1.2], [0,1, 2.3] ...]
// quartile should be a float: eg 0.25 implies
// drop bottom 25% and top 25% of all values.
// Returns min and max after dropping
export function getQuartiles(data, quartile) {
  const sortedData = _.orderBy(data, function (datum) {
    return datum[2]
  })

  const numToDrop = Math.floor(sortedData.length * quartile)
  const dropped = _.dropRight(_.drop(sortedData, numToDrop), numToDrop)

  return {
    min: _.first(dropped)[2],
    max: _.last(dropped)[2]
  }
}
