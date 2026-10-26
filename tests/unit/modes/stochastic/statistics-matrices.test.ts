/**
 * Matrix functions of the statistics module.
 *
 * `correlationMatrix` and `covarianceMatrix` read the columns of a table of samples (one row for
 * each sample, one column for each variable) and fill a square matrix. The cells below the
 * diagonal copy the cells above it. The diagonal of the correlation matrix is 1 for every
 * column. The diagonal of the covariance matrix is the covariance of the column with itself.
 * `computeSampleStatistics` reads the same columns.
 */

import { describe, it, expect } from "vitest";
import {
  correlation,
  correlationMatrix,
  covariance,
  covarianceMatrix,
  computeSampleStatistics,
  mean,
} from "../../../../src/modes/stochastic/analysis/statistics.js";

/** Rows of three variables: x rises, y is 2x and z falls. */
const SAMPLES = [
  [1, 2, 4],
  [2, 4, 3],
  [3, 6, 1],
  [4, 8, 2],
  [5, 11, 0],
];

const column = (samples: number[][], j: number): number[] =>
  samples.map((row) => row[j]);

describe("correlationMatrix()", () => {
  it("holds the correlation of every pair of columns", () => {
    const matrix = correlationMatrix(SAMPLES);
    expect(matrix).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(matrix[i]).toHaveLength(3);
      for (let j = 0; j < 3; j++) {
        if (i !== j) {
          expect(matrix[i][j]).toBe(
            correlation(column(SAMPLES, i), column(SAMPLES, j)),
          );
        }
      }
    }
  });

  it("has a diagonal of exactly 1, also for a constant column and a column of NaN", () => {
    const samples = [
      [5, 1, Number.NaN],
      [5, 2, Number.NaN],
      [5, 4, Number.NaN],
    ];
    const matrix = correlationMatrix(samples);
    expect(matrix.map((row, i) => row[i])).toEqual([1, 1, 1]);
    // A constant column has no correlation with another column: the function gives 0.
    expect(matrix[0][1]).toBe(0);
    expect(matrix[0][2]).toBe(0);
    expect(Number.isNaN(matrix[1][2])).toBe(true);
  });

  it("is symmetric, cell for cell", () => {
    const matrix = correlationMatrix(SAMPLES);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < i; j++)
        expect(Object.is(matrix[i][j], matrix[j][i])).toBe(true);
    }
  });

  it("gives one cell for one column", () => {
    expect(correlationMatrix([[3], [5], [9]])).toEqual([[1]]);
  });

  it("gives an empty matrix for no samples and for samples without columns", () => {
    expect(correlationMatrix([])).toEqual([]);
    expect(correlationMatrix([[], []])).toEqual([]);
  });

  it("gives each row its own array", () => {
    const matrix = correlationMatrix(SAMPLES);
    expect(new Set(matrix).size).toBe(3);
  });
});

describe("covarianceMatrix()", () => {
  it("holds the covariance of every pair of columns, also on the diagonal", () => {
    const matrix = covarianceMatrix(SAMPLES);
    expect(matrix).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(matrix[i]).toHaveLength(3);
      for (let j = 0; j < 3; j++) {
        expect(matrix[i][j]).toBe(
          covariance(column(SAMPLES, i), column(SAMPLES, j)),
        );
      }
    }
  });

  it("has a diagonal of 0 for a constant column, not 1", () => {
    const matrix = covarianceMatrix([
      [5, 1],
      [5, 2],
      [5, 4],
    ]);
    expect(matrix[0][0]).toBe(0);
    expect(matrix[0][1]).toBe(0);
    expect(matrix[1][1]).toBeGreaterThan(0);
  });

  it("is symmetric, cell for cell", () => {
    const matrix = covarianceMatrix(SAMPLES);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < i; j++)
        expect(Object.is(matrix[i][j], matrix[j][i])).toBe(true);
    }
  });

  it("gives one cell for one column", () => {
    expect(covarianceMatrix([[3], [5], [9]])).toEqual([
      [covariance([3, 5, 9], [3, 5, 9])],
    ]);
  });

  it("gives an empty matrix for no samples and for samples without columns", () => {
    expect(covarianceMatrix([])).toEqual([]);
    expect(covarianceMatrix([[], []])).toEqual([]);
  });

  it("gives each row its own array", () => {
    expect(new Set(covarianceMatrix(SAMPLES)).size).toBe(3);
  });
});

describe("computeSampleStatistics() reads the columns of the table", () => {
  it("gives the mean of each column and the correlation matrix of the table", () => {
    const stats = computeSampleStatistics(SAMPLES);
    expect(stats.mean).toEqual([0, 1, 2].map((j) => mean(column(SAMPLES, j))));
    expect(stats.correlations).toEqual(correlationMatrix(SAMPLES));
    expect(stats.variance).toHaveLength(3);
    expect(stats.percentiles[50]).toHaveLength(3);
  });

  it("gives empty results for no samples", () => {
    const stats = computeSampleStatistics([]);
    expect(stats.mean).toEqual([]);
    expect(stats.correlations).toEqual([]);
  });
});
