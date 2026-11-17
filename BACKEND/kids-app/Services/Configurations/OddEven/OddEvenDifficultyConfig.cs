using kids_app.Services.Configurations.Addition;

namespace kids_app.Services.Configurations.OddEven
{
    public static class OddEvenDifficultyConfig
    {
        
        public static readonly Dictionary<int, DifficultyRange[]> PairingRemainderByLevel = new()
        {
            {
                1,
                new[]
                {
                    new DifficultyRange(2, 10),
                    new DifficultyRange(2, 15),
                    new DifficultyRange(2, 20)
                }
            },
            {
                2,
                new[]
                {
                    new DifficultyRange(2, 20),
                    new DifficultyRange(10, 30),
                    new DifficultyRange(20, 40)
                }
            },
            {
                3,
                new[]
                {
                    new DifficultyRange(10, 30),
                    new DifficultyRange(20, 50),
                    new DifficultyRange(30, 70)
                }
            },
            {
                4,
                new[]
                {
                    new DifficultyRange(20, 50),
                    new DifficultyRange(40, 80),
                    new DifficultyRange(60, 100)
                }
            }
        };


        public static readonly Dictionary<int, DifficultyRange[]>
            CountSetByLevel = new()
        {
            {
                1,
                new[]
                {
                    new DifficultyRange(1, 10),
                    new DifficultyRange(1, 20),
                    new DifficultyRange(1, 30)
                }
            },
            {
                2,
                new[]
                {
                    new DifficultyRange(1, 30),
                    new DifficultyRange(10, 50),
                    new DifficultyRange(20, 100)
                }
            },
            {
                3,
                new[]
                {
                    new DifficultyRange(10, 50),
                    new DifficultyRange(20, 100),
                    new DifficultyRange(50, 200)
                }
            },
            {
                4,
                new[]
                {
                    new DifficultyRange(20, 100),
                    new DifficultyRange(50, 200),
                    new DifficultyRange(100, 500)
                }
            }
        };

       

        public static readonly Dictionary<int, DifficultyRange[]>
            SumParityByLevel = new()
        {
            {
                1,
                new[]
                {
                    new DifficultyRange(1, 10),
                    new DifficultyRange(1, 20),
                    new DifficultyRange(1, 30)
                }
            },
            {
                2,
                new[]
                {
                    new DifficultyRange(1, 20),
                    new DifficultyRange(10, 50),
                    new DifficultyRange(20, 100)
                }
            },
            {
                3,
                new[]
                {
                    new DifficultyRange(10, 50),
                    new DifficultyRange(20, 100),
                    new DifficultyRange(50, 200)
                }
            },
            {
                4,
                new[]
                {
                    new DifficultyRange(20, 100),
                    new DifficultyRange(50, 200),
                    new DifficultyRange(100, 500)
                }
            }
        };
        public static readonly Dictionary<int, DifficultyRange[]>
           StartingNumberByLevel = new()
       {
            {
                2,
                new[]
                {
                    new DifficultyRange(10, 20),   
                    new DifficultyRange(20, 50),   
                    new DifficultyRange(50, 100)  
                }
            }
       };
        public static readonly Dictionary<int, DifficultyRange[]>
          SubtractionParityByLevel = new()
      {
            {
                2,
                new[]
                {
                    new DifficultyRange(10, 20), 
                    new DifficultyRange(20, 40), 
                    new DifficultyRange(40, 60) 
                }
            }
      };
        public static readonly Dictionary<int, DifficultyRange[]>
           MissingAddendParityByLevel = new()
       {
            {
                2,
                new[]
                {
                    new DifficultyRange(1, 20),
                    new DifficultyRange(10, 40), 
                    new DifficultyRange(20, 60)  
                }
            }
       };
        public static readonly Dictionary<int, DifficultyRange[]>
         ObjectTransferByLevel = new()
     {
            {
                1,
                new[]
                {
                    new DifficultyRange(4, 10),  // Easy
                    new DifficultyRange(8, 16),  // Medium
                    new DifficultyRange(12, 24)  // Hard
                }
            }
     };

        // ODD_EVEN_OBJECT_PACKING_REMAINDER
        // Total number of objects packed into groups of three.
        public static readonly Dictionary<int, DifficultyRange[]>
            ObjectPackingRemainderByLevel = new()
        {
            {
                1,
                new[]
                {
                    new DifficultyRange(10, 20), // Easy
                    new DifficultyRange(15, 30), // Medium
                    new DifficultyRange(20, 40)  // Hard
                }
            }
        };

        // ODD_EVEN_OBJECT_REMOVAL_TARGET
        // Initial number of objects before removal.
        public static readonly Dictionary<int, DifficultyRange[]>
            ObjectRemovalTargetByLevel = new()
        {
            {
                1,
                new[]
                {
                    new DifficultyRange(10, 20), // Easy
                    new DifficultyRange(15, 30), // Medium
                    new DifficultyRange(20, 40)  // Hard
                }
            }
        };

        // ODD_EVEN_HIDDEN_OBJECT_PARITY
        // Total number of objects, including visible and hidden objects.
        public static readonly Dictionary<int, DifficultyRange[]>
            HiddenObjectParityByLevel = new()
        {
            {
                1,
                new[]
                {
                    new DifficultyRange(10, 20), // Easy
                    new DifficultyRange(15, 30), // Medium
                    new DifficultyRange(20, 40)  // Hard
                }
            }
        };
     
     
            // ODD_EVEN_GRID_PATH_LENGTH
            // Range represents the total number of grid moves.
            public static readonly Dictionary<int, DifficultyRange[]>
                GridPathLengthByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 6),   // Easy
                    new DifficultyRange(4, 10),  // Medium
                    new DifficultyRange(6, 14)   // Hard
                }
            }
            };

            // ODD_EVEN_DIGIT_PRODUCT_PARITY
            // Range represents the two-digit number.
            public static readonly Dictionary<int, DifficultyRange[]>
                DigitProductParityByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(10, 39), // Easy
                    new DifficultyRange(20, 69), // Medium
                    new DifficultyRange(40, 99)  // Hard
                }
            }
            };

            // ODD_EVEN_AREA_TILE_PARITY
            // Range represents rows and columns of tiles.
            public static readonly Dictionary<int, DifficultyRange[]>
                AreaTileParityByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 5),   // Easy
                    new DifficultyRange(3, 8),   // Medium
                    new DifficultyRange(4, 12)   // Hard
                }
            }
            };

            // ODD_EVEN_DOUBLE_MINUS_ONE
            // Range represents the starting whole number.
            public static readonly Dictionary<int, DifficultyRange[]>
                DoubleMinusOneByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 10),  // Easy
                    new DifficultyRange(5, 25),  // Medium
                    new DifficultyRange(10, 50)  // Hard
                }
            }
            };
  
            public static readonly Dictionary<int, DifficultyRange[]>
                TriangularDotParityByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(3, 5),   // Easy
                    new DifficultyRange(4, 7),   // Medium
                    new DifficultyRange(6, 10)   // Hard
                }
            }
            };

            // ODD_EVEN_TOURNAMENT_BYE
            // Range = number of players.
            public static readonly Dictionary<int, DifficultyRange[]>
                TournamentByeByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(3, 8),    // Easy
                    new DifficultyRange(5, 14),   // Medium
                    new DifficultyRange(9, 24)    // Hard
                }
            }
            };

            // ODD_EVEN_REPEATED_PATTERN_PARITY
            // Range = number of repeated batches.
            public static readonly Dictionary<int, DifficultyRange[]>
                RepeatedPatternParityByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 6),    // Easy
                    new DifficultyRange(4, 10),   // Medium
                    new DifficultyRange(6, 15)    // Hard
                }
            }
            };

            // ODD_EVEN_3D_SHAPE_EDGE_PARITY
            // Range = available shape edge counts.
            public static readonly Dictionary<int, DifficultyRange[]>
                ShapeEdgeParityByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(6, 12),    // Easy
                    new DifficultyRange(6, 18),    // Medium
                    new DifficultyRange(6, 24)     // Hard
                }
            }
            };
      
            // ODD_EVEN_RECTANGLE_PERIMETER_REASONING
            // Range represents whole-number side lengths in centimeters.
            public static readonly Dictionary<int, DifficultyRange[]>
                RectanglePerimeterByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 10),  // Easy
                    new DifficultyRange(5, 20),  // Medium
                    new DifficultyRange(10, 50)  // Hard
                }
            }
            };

            // ODD_EVEN_DOMINO_BOARD_COVERABILITY
            // Range represents rows and columns of unit squares.
            public static readonly Dictionary<int, DifficultyRange[]>
                DominoBoardByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 5),   // Easy
                    new DifficultyRange(3, 8),   // Medium
                    new DifficultyRange(4, 12)   // Hard
                }
            }
            };

            // ODD_EVEN_HANDSHAKE_COUNT
            // Range represents the number of children.
            public static readonly Dictionary<int, DifficultyRange[]>
                HandshakeCountByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(3, 4),   // Easy
                    new DifficultyRange(5, 6),   // Medium
                    new DifficultyRange(7, 10)   // Hard
                }
            }
            };

            // ODD_EVEN_PRIME_EXCEPTION
            // Range represents candidate numbers other than 2.
            public static readonly Dictionary<int, DifficultyRange[]>
                PrimeExceptionByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(3, 8),   // Easy
                    new DifficultyRange(3, 15),  // Medium
                    new DifficultyRange(3, 30)   // Hard
                }
            }
            };

        public static class OddEvenContextDifficultyConfig
        {
            // ODD_EVEN_LIGHT_TOGGLE_STATE
            // Range: number of switch presses.
            public static readonly Dictionary<int, DifficultyRange[]>
                LightToggleByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 6),   // Easy
                    new DifficultyRange(4, 8),   // Medium
                    new DifficultyRange(6, 12)   // Hard
                }
            }
            };

            // ODD_EVEN_ELEVATOR_FLOOR_PARITY
            // Range: starting floor and maximum upward movement.
            public static readonly Dictionary<int, DifficultyRange[]>
                ElevatorFloorByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 10),  // Easy
                    new DifficultyRange(5, 20),  // Medium
                    new DifficultyRange(10, 30)  // Hard
                }
            }
            };

            // ODD_EVEN_TOY_COPY_MACHINE
            // Range: initial number of toys.
            public static readonly Dictionary<int, DifficultyRange[]>
                ToyCopyMachineByLevel = new()
            {
            {
                4,
                new[]
                {
                    new DifficultyRange(2, 10),  // Easy
                    new DifficultyRange(5, 15),  // Medium
                    new DifficultyRange(10, 25)  // Hard
                }
            }
            };
        }
    }
}
    

