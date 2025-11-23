$(document).ready(function() {
    // Lista de 10 películas
    const allMovies = [
        { title: 'Inception', year: 2010, genre: 'Ciencia Ficción' },
        { title: 'The Dark Knight', year: 2008, genre: 'Acción' },
        { title: 'Pulp Fiction', year: 1994, genre: 'Crimen' },
        { title: 'The Matrix', year: 1999, genre: 'Ciencia Ficción' },
        { title: 'Interstellar', year: 2014, genre: 'Ciencia Ficción' },
        { title: 'Forrest Gump', year: 1994, genre: 'Drama' },
        { title: 'Fight Club', year: 1999, genre: 'Drama' },
        { title: 'The Godfather', year: 1972, genre: 'Crimen' },
        { title: 'Titanic', year: 1997, genre: 'Romance' },
        { title: 'Avatar', year: 2009, genre: 'Ciencia Ficción' }
    ];
    
    // Variables globales
    let selectedMovie = null;
    let totalSeats = 0;
    
    // Función para obtener elementos aleatorios de un array
    function getRandomElements(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    // Seleccionar 3 películas aleatorias
    const randomMovies = getRandomElements(allMovies, 3);
    
    // Crear el selector de películas
    function createMovieSelector() {
        const movieList = $('#movie-list');
        movieList.empty();
        
        randomMovies.forEach((movie, index) => {
            const movieCard = $(`
                <div class="movie-card" data-movie-index="${index}">
                    <h3>${movie.title}</h3>
                    <p class="movie-year">${movie.year}</p>
                    <p class="movie-genre">${movie.genre}</p>
                    <button class="select-movie-btn" data-movie-index="${index}">Seleccionar</button>
                </div>
            `);
            movieList.append(movieCard);
        });
    }
    
    // Inicializar selector de películas
    createMovieSelector();
    
    // Manejar selección de película
    $(document).on('click', '.select-movie-btn', function() {
        const movieIndex = $(this).data('movie-index');
        selectedMovie = randomMovies[movieIndex];
        
        // Actualizar visualmente las tarjetas
        $('.movie-card').removeClass('selected');
        $(`.movie-card[data-movie-index="${movieIndex}"]`).addClass('selected');
        
        // Actualizar panel de información
        updateSelectionInfo();
        
        // Ocupar asientos aleatorios cuando se selecciona una película
        if ($('.seat.occupied').length === 0) {
            occupyRandomSeats();
        }
    });
    
    // Función para ocupar asientos aleatorios
    function occupyRandomSeats() {
        const seats = $('.seat');
        totalSeats = seats.length;
        
        // Calcular porcentaje de asientos ocupados (entre 15% y 30%)
        const occupancyRate = 0.15 + Math.random() * 0.15;
        const occupiedCount = Math.floor(totalSeats * occupancyRate);
        
        // Obtener índices aleatorios de asientos para ocupar
        const seatIndices = Array.from({ length: totalSeats }, (_, i) => i);
        const occupiedIndices = getRandomElements(seatIndices, occupiedCount);
        
        // Marcar asientos como ocupados
        seats.each(function(index) {
            if (occupiedIndices.includes(index)) {
                $(this).addClass('occupied');
            }
        });
    }
    
    // Función para convertir número a letra (0->A, 1->B, etc.)
    function numberToLetter(num) {
        return String.fromCharCode(65 + num); // 65 es el código ASCII de 'A'
    }
    
    // Asignar nombres a los asientos según su posición (columna letra + fila número)
    function assignSeatNames() {
        let globalColumnStart = 0; // Columna global actual (0 = A, 1 = B, etc.)
        let globalRowStart = 1; // Fila global actual (empezando en 1)
        
        // Procesar cada fila de bloques (.seats contiene una fila de bloques)
        $('.seats').each(function() {
            const $seatsRow = $(this);
            const blocks = $seatsRow.find('.seat-block');
            
            // Resetear columnas al inicio de cada fila de bloques
            globalColumnStart = 0;
            
            // Procesar cada bloque en esta fila
            blocks.each(function() {
                const $block = $(this);
                const seats = $block.find('.seat');
                
                // Determinar número de columnas según la clase del bloque
                let columns = 4; // Por defecto
                if ($block.hasClass('block-4x10')) {
                    columns = 10;
                } else if ($block.hasClass('block-4x4')) {
                    columns = 4;
                }
                
                const rowsInBlock = Math.ceil(seats.length / columns);
                
                // Asignar nombres a cada asiento en este bloque
                seats.each(function(index) {
                    const columnIndex = index % columns;
                    const rowIndex = Math.floor(index / columns);
                    
                    const columnLetter = numberToLetter(globalColumnStart + columnIndex);
                    const seatRow = globalRowStart + rowIndex;
                    const seatName = columnLetter + seatRow;
                    
                    $(this).attr('data-seat-name', seatName);
                    $(this).attr('data-seat-index', index);
                });
                
                // Avanzar a la siguiente columna global para el siguiente bloque
                globalColumnStart += columns;
            });
            
            // Avanzar a la siguiente fila global
            if (blocks.length > 0) {
                const firstBlock = blocks.first();
                const firstBlockSeats = firstBlock.find('.seat');
                let columns = 4;
                if (firstBlock.hasClass('block-4x10')) {
                    columns = 10;
                }
                const rowsInRow = Math.ceil(firstBlockSeats.length / columns);
                globalRowStart += rowsInRow;
            }
        });
    }
    
    // Asignar nombres a los asientos
    assignSeatNames();
    
    // Crear panel de información de selección
    const infoPanel = $('<div class="selection-info"></div>');
    infoPanel.html(`
        <h3>Información de Reserva</h3>
        <p id="selected-movie">Película: <span>Ninguna seleccionada</span></p>
        <p>Asientos seleccionados: <span id="selected-count">0</span></p>
        <p id="selected-seats-list">Ningún asiento seleccionado</p>
        <button id="clear-selection" class="clear-btn">Limpiar Selección</button>
    `);
    // Insertar el panel después del bloque de selección de películas
    $('.movie-selection').after(infoPanel);
    
    // Función para actualizar el panel de información
    function updateSelectionInfo() {
        const selectedSeats = $('.seat.selected');
        const count = selectedSeats.length;
        $('#selected-count').text(count);
        
        // Actualizar información de película
        if (selectedMovie) {
            $('#selected-movie span').text(`${selectedMovie.title} (${selectedMovie.year})`);
            $('#selected-movie span').css('color', '#4CAF50');
        } else {
            $('#selected-movie span').text('Ninguna seleccionada');
            $('#selected-movie span').css('color', '#cccccc');
        }
        
        if (count > 0) {
            const seatsList = selectedSeats.map(function() {
                return $(this).attr('data-seat-name');
            }).get().join(', ');
            $('#selected-seats-list').text(`Asientos: ${seatsList}`);
        } else {
            $('#selected-seats-list').text('Ningún asiento seleccionado');
        }
    }
    
    // Click en asiento para seleccionar/deseleccionar
    $('.seat').on('click', function() {
        const $seat = $(this);
        
        // Verificar si hay una película seleccionada
        if (!selectedMovie) {
            alert('Por favor, selecciona una película primero.');
            return;
        }
        
        // No hacer nada si el asiento está ocupado
        if ($seat.hasClass('occupied')) {
            // Animación de "no disponible"
            $seat.css('animation', 'shake 0.5s');
            setTimeout(() => {
                $seat.css('animation', '');
            }, 500);
            return;
        }
        
        // Alternar selección
        if ($seat.hasClass('selected')) {
            $seat.removeClass('selected');
            $seat.find('.seat-label').remove();
            $seat.fadeTo(200, 1);
        } else {
            $seat.addClass('selected');
            
            // Mostrar el nombre del asiento sobre el asiento seleccionado
            const seatName = $seat.attr('data-seat-name');
            if (seatName && !$seat.find('.seat-label').length) {
                const label = $('<div class="seat-label"></div>');
                label.text(seatName);
                $seat.append(label);
                label.fadeIn(200);
            }
            
            // Animación al seleccionar
            $seat.css('animation', 'pulse 0.3s');
            setTimeout(() => {
                $seat.css('animation', '');
            }, 300);
        }
        
        updateSelectionInfo();
    });
    
    // Botón para limpiar selección
    $('#clear-selection').on('click', function() {
        $('.seat.selected').removeClass('selected');
        $('.seat-label').remove();
        updateSelectionInfo();
    });
    
    // Tooltip al pasar el mouse sobre un asiento
    $('.seat').hover(
        function() {
            const $seat = $(this);
            const seatName = $seat.attr('data-seat-name');
            let status = 'Disponible';
            
            if ($seat.hasClass('occupied')) {
                status = 'Ocupado';
            } else if ($seat.hasClass('selected')) {
                status = 'Seleccionado';
            }
            
            // Crear tooltip
            const tooltip = $('<div class="seat-tooltip"></div>');
            tooltip.text(`Asiento ${seatName} - ${status}`);
            $seat.append(tooltip);
            
            // Posicionar tooltip
            setTimeout(() => {
                tooltip.fadeIn(200);
            }, 10);
        },
        function() {
            $(this).find('.seat-tooltip').fadeOut(200, function() {
                $(this).remove();
            });
        }
    );
    
    // Inicializar el contador
    updateSelectionInfo();
    
    // Efecto de "ondas" al pasar el mouse sobre la pantalla
    $('.screen').on('mouseenter', function() {
        $(this).css('box-shadow', 
            'inset 0 0 30px rgba(0, 0, 0, 0.8), ' +
            'inset 0 10px 40px rgba(255, 255, 255, 0.2), ' +
            '0 0 30px rgba(255, 255, 255, 0.3), ' +
            '0 5px 15px rgba(0, 0, 0, 0.3)'
        );
    }).on('mouseleave', function() {
        $(this).css('box-shadow', 
            'inset 0 0 30px rgba(0, 0, 0, 0.8), ' +
            'inset 0 10px 40px rgba(255, 255, 255, 0.1), ' +
            '0 0 20px rgba(0, 0, 0, 0.5), ' +
            '0 5px 15px rgba(0, 0, 0, 0.3)'
        );
    });
});

// Animaciones CSS adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
    }
    
    .movie-selection {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
    }
    
    .movie-selection h2 {
        color: #ffffff;
        font-size: 2rem;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 2px;
    }
    
    .movie-list {
        display: flex;
        justify-content: center;
        gap: 30px;
        flex-wrap: wrap;
        margin: 20px 0;
    }
    
    .movie-card {
        background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
        border: 2px solid #444;
        border-radius: 10px;
        padding: 20px;
        width: 200px;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .movie-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(196, 30, 58, 0.4);
        border-color: #c41e3a;
    }
    
    .movie-card.selected {
        border-color: #4CAF50;
        box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
        background: linear-gradient(135deg, #2d4d2d 0%, #1a3a1a 100%);
    }
    
    .movie-card h3 {
        color: #ffffff;
        font-size: 1.3rem;
        margin: 0 0 10px 0;
    }
    
    .movie-year {
        color: #c41e3a;
        font-size: 1rem;
        font-weight: bold;
        margin: 5px 0;
    }
    
    .movie-genre {
        color: #cccccc;
        font-size: 0.9rem;
        margin: 5px 0 15px 0;
    }
    
    .select-movie-btn {
        background-color: #c41e3a;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        width: 100%;
        transition: all 0.3s ease;
    }
    
    .select-movie-btn:hover {
        background-color: #d42e4a;
        transform: scale(1.05);
    }
    
    .movie-card.selected .select-movie-btn {
        background-color: #4CAF50;
    }
    
    .movie-card.selected .select-movie-btn:hover {
        background-color: #45a049;
    }
    
    .selection-info {
        background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
        padding: 20px;
        margin: 20px auto;
        max-width: 500px;
        border-radius: 10px;
        border: 2px solid #c41e3a;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        text-align: center;
    }
    
    .selection-info h3 {
        margin-top: 0;
        color: #ffffff;
        font-size: 1.5rem;
        margin-bottom: 15px;
    }
    
    .selection-info p {
        color: #cccccc;
        margin: 10px 0;
        font-size: 1rem;
    }
    
    #selected-count {
        color: #4CAF50;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    #selected-movie span {
        color: #cccccc;
        font-weight: bold;
    }
    
    #selected-seats-list {
        color: #ffffff;
        font-weight: normal;
    }
    
    .clear-btn {
        background-color: #c41e3a;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 10px;
        transition: all 0.3s ease;
    }
    
    .clear-btn:hover {
        background-color: #d42e4a;
        transform: scale(1.05);
        box-shadow: 0 4px 10px rgba(196, 30, 58, 0.4);
    }
    
    .seat-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.8rem;
        white-space: nowrap;
        margin-bottom: 5px;
        z-index: 1000;
        pointer-events: none;
        display: none;
    }
    
    .seat-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.9);
    }
`;
document.head.appendChild(style);
