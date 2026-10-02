const codeShowcaseProjects = [
  {
    id: 'easycode',
    name: 'EasyCode',
    type: 'Full-stack low-code platform',
    description: 'A collaborative builder with approvals, audit history, version control, granular access, and live editing.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'WebSockets'],
    samples: [
      {
        title: 'Approval workflow', language: 'PHP', path: 'EasyCode/api/platform.php',
        description: 'Keeps publishing states valid by allowing only sequential workflow transitions.',
        context: 'Business rules are centralized so every API endpoint follows the same approval process.',
        code: String.raw`function workflow_next_status(string $current, string $direction = 'next'): string {
    $order = WORKFLOW_STATUSES;
    $idx = array_search($current, $order, true);
    if ($idx === false) $idx = 0;

    if ($direction === 'previous') {
        return $order[max(0, $idx - 1)];
    }
    return $order[min(count($order) - 1, $idx + 1)];
}

function validate_workflow_transition(string $current, string $target): void {
    $order = WORKFLOW_STATUSES;
    $from = array_search($current, $order, true);
    $to = array_search($target, $order, true);

    if ($from === false || $to === false) fail('Invalid workflow status.');
    if (abs($to - $from) > 1) fail('Workflow must move step by step.');
}`
      },
      {
        title: 'Version snapshots', language: 'PHP', path: 'EasyCode/api/platform.php',
        description: 'Creates an immutable numbered snapshot and hashes its complete page content.',
        context: 'Transactional version numbers and content hashes make restore history reliable and traceable.',
        code: String.raw`function create_page_version(PDO $pdo, int $pageId, ?int $userId,
    string $type, string $status, string $contentJson,
    ?string $html, ?string $css, ?string $js, ?string $note): int {

    $stmt = $pdo->prepare(
        'SELECT COALESCE(MAX(version_number), 0) + 1
         FROM page_versions WHERE page_id = ? FOR UPDATE'
    );
    $stmt->execute([$pageId]);
    $versionNo = (int) $stmt->fetchColumn();
    $hash = hash('sha256', $contentJson . '|' . $html . '|' . $css . '|' . $js);

    $stmt = $pdo->prepare(
        'INSERT INTO page_versions
         (page_id, version_number, version_type, status, content_json,
          html_cache, css_code, js_code, content_hash, change_note, created_by)
         VALUES (?, ?, ?, ?, CAST(? AS JSON), ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$pageId, $versionNo, $type, $status, $contentJson,
        $html, $css, $js, $hash, $note, $userId]);

    return (int) $pdo->lastInsertId();
}`
      }
    ]
  },
  {
    id: 'aiconnect',
    name: 'AIConnect',
    type: 'Recruitment & CV platform',
    description: 'Job discovery, applications, employer dashboards, structured profiles, and AI-assisted CV creation.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'REST APIs'],
    samples: [
      {
        title: 'CV data pipeline', language: 'JavaScript', path: 'AIConnect/assets/js/apis.js',
        description: 'Normalizes every CV section into one structured payload before generation.',
        context: 'A single data contract keeps the editor, storage endpoints, and PDF templates synchronized.',
        code: String.raw`function buildDataJson() {
  return {
    full_name: v('cvFullName'),
    email: v('cvEmail'),
    phone: v('cvPhone'),
    location: v('cvLocation'),
    headline: v('cvHeadline') || '',
    summary: v('cvSummary'),
    skills: collectSkills(),
    languages: collectLanguages(),
    certifications: collectCertifications(),
    projects: collectProjects(),
    educations: collectEducations(),
    experiences: collectExperiences()
  };
}

async function generateCV() {
  const profile = buildDataJson();
  if (!profile.full_name) {
    setStatus('Please enter your full name.', true);
    return;
  }

  const payload = new FormData();
  payload.set('full_name', profile.full_name);
  payload.set('skills', profile.skills.map(item => item.skill_name).join(', '));
}`
      },
      {
        title: 'Duplicate-safe applications', language: 'PHP', path: 'AIConnect/assets/php/apply_job.php',
        description: 'Validates identifiers and prevents a user from submitting the same application twice.',
        context: 'Prepared statements keep the application flow predictable and protect database inputs.',
        code: String.raw`$userId = (int) ($_POST['user_id'] ?? 0);
$jobId  = (int) ($_POST['job_id'] ?? 0);

if ($userId <= 0 || $jobId <= 0) {
    out(['ok' => false, 'error' => 'Missing parameters'], 400);
}

$check = $pdo->prepare(
    'SELECT 1 FROM job_applications
     WHERE user_id = :user_id AND job_id = :job_id LIMIT 1'
);
$check->execute([':user_id' => $userId, ':job_id' => $jobId]);

if ($check->fetchColumn()) {
    out(['ok' => true, 'already_applied' => true]);
}

$insert = $pdo->prepare(
    "INSERT INTO job_applications (user_id, job_id, status, applied_at)
     VALUES (:user_id, :job_id, 'submitted', NOW())"
);
$insert->execute([':user_id' => $userId, ':job_id' => $jobId]);`
      }
    ]
  },
  {
    id: 'cyber-alert',
    name: 'Cyber Alert',
    type: 'Cybersecurity analysis tool',
    description: 'URL, IP, and email analysis supported by reputation intelligence and phishing-risk scoring.',
    stack: ['JavaScript', 'PHP', 'MySQL', 'Threat APIs'],
    samples: [
      {
        title: 'Email forensics', language: 'JavaScript', path: 'Cyber Alert/js/virusTotal.js',
        description: 'Reads an uploaded email, splits headers and body, then extracts the sender IP for analysis.',
        context: 'The parsing pipeline combines message inspection with external IP reputation checks.',
        code: String.raw`function handleEmailUpload() {
  const file = document.getElementById('emailFile').files[0];
  if (!file) return alert('Please select an email file.');

  const reader = new FileReader();
  reader.onload = event => {
    const emailContent = event.target.result;
    const headers = extractEmailHeaders(emailContent);
    const body = extractEmailBody(emailContent);

    displayEmailInfo(headers, body);

    const senderIP = extractSenderIP(headers);
    if (senderIP) checkIpSafetyForEmail(senderIP);
    analyzeMaliciousContent(body);
  };

  reader.readAsText(file);
}

function extractEmailHeaders(emailContent) {
  const headers = {};
  const headerRegex = /^(.*?):\s*(.*)$/gm;
  let match;
  while ((match = headerRegex.exec(emailContent)) !== null) {
    headers[match[1]] = match[2];
  }
  return headers;
}`
      },
      {
        title: 'Phishing risk scoring', language: 'JavaScript', path: 'Cyber Alert/js/virusTotal.js',
        description: 'Matches stored phishing indicators and weights each hit by its configured risk level.',
        context: 'The rules come from the database, allowing the detection vocabulary to evolve without editing the client.',
        code: String.raw`async function analyzeMaliciousContent(body) {
  const response = await fetch('php/getPhishingKeywords.php');
  const phishingKeywords = await response.json();
  if (!Array.isArray(phishingKeywords)) return;

  const riskLevels = { Low: 1, Medium: 2, High: 3 };
  const foundKeywords = [];
  let totalRiskScore = 0;

  phishingKeywords.forEach(({ keyword, risk_level }) => {
    const pattern = new RegExp('\\b' + keyword + '\\b', 'i');
    if (pattern.test(body)) {
      foundKeywords.push({ keyword, risk_level });
      totalRiskScore += riskLevels[risk_level];
    }
  });

  return { foundKeywords, totalRiskScore };
}`
      }
    ]
  },
  {
    id: 'smarted',
    name: 'SmartED',
    type: 'Learning management system',
    description: 'Courses, assignments, teaching schedules, live meetings, student dashboards, and assisted learning.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'Role Access'],
    samples: [
      {
        title: 'Course ownership check', language: 'PHP', path: 'SmartED/php/create_meeting.php',
        description: 'Authorizes the teacher and confirms course ownership before scheduling a meeting.',
        context: 'The endpoint checks both role and resource ownership instead of trusting submitted course data.',
        code: String.raw`session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
    exit();
}

$organizerId = $_SESSION['user_id'];
$courseId = intval($_POST['course_id'] ?? 0);

$courseCheck = $conn->prepare(
    'SELECT course_id FROM courses WHERE course_id = ? AND teacher_id = ?'
);
$courseCheck->bind_param('ii', $courseId, $organizerId);
$courseCheck->execute();
$courseCheck->store_result();

if ($courseCheck->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Insufficient permission.']);
    exit();
}`
      },
      {
        title: 'Assignment creation', language: 'PHP', path: 'SmartED/php/add_assignment.php',
        description: 'Stores an assignment with its course, deadline, uploaded file reference, and grade value.',
        context: 'A prepared insert keeps the learning record and its uploaded resource tied to one course.',
        code: String.raw`$courseId = intval($_POST['course_id'] ?? 0);
$assignmentName = trim($_POST['assignment_name'] ?? '');
$dueDate = trim($_POST['due_date'] ?? '');
$grade = intval($_POST['grade'] ?? 0);
$assignmentFile = $storedFileName ?? null;

$stmt = $conn->prepare(
    'INSERT INTO assignments
     (course_id, assignment_name, due_date, assignment_file, grade)
     VALUES (?, ?, ?, ?, ?)'
);
$stmt->bind_param(
    'isssi',
    $courseId,
    $assignmentName,
    $dueDate,
    $assignmentFile,
    $grade
);
$stmt->execute();`
      }
    ]
  },
  {
    id: 'anthodrive',
    name: 'AnthoDrive',
    type: 'Hybrid driving quiz app',
    description: 'A mobile-ready driving theory quiz with category balancing, timers, answer review, and offline history.',
    stack: ['JavaScript', 'Cordova', 'SQLite', 'IndexedDB'],
    samples: [
      {
        title: 'Balanced quiz engine', language: 'JavaScript', path: 'Car App/QuizDriveByAnthony/www/js/quiz.js',
        description: 'Builds a randomized test while preserving the requested number of questions per category.',
        context: 'Category-based selection keeps each attempt balanced across law, signs, and safety topics.',
        code: String.raw`function getRandomQuestions(category, count) {
  const filtered = quizData.filter(question => question.category === category);
  return filtered.sort(() => 0.5 - Math.random()).slice(0, count);
}

function setupQuiz(lawCount, signsCount, safetyCount) {
  quizData = [
    ...getRandomQuestions('Law', lawCount),
    ...getRandomQuestions('Signs', signsCount),
    ...getRandomQuestions('Safety', safetyCount)
  ].sort(() => 0.5 - Math.random());

  currentQuestion = 0;
  userAnswers = [];
  showQuestion();
  startTimer();
}`
      },
      {
        title: 'Offline attempt history', language: 'JavaScript', path: 'Car App/QuizDriveByAnthony/www/js/quiz.js',
        description: 'Saves quiz attempts and individual answers in a local SQLite transaction.',
        context: 'The hybrid app retains detailed review history even without an internet connection.',
        code: String.raw`function saveAttemptSQLite(result, questionsArray) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO quiz_attempts (user, time_left, saved_at) VALUES (?, ?, ?)',
      [result.user, result.timeLeft, Date.now()],
      (_, attemptResult) => {
        const attemptId = attemptResult.insertId;

        questionsArray.forEach((question, index) => {
          tx.executeSql(
            'INSERT INTO quiz_answers ' +
            '(attempt_id, question_id, selected_index, correct_index) ' +
            'VALUES (?, ?, ?, ?)',
            [attemptId, question.id, result.answers[index], question.correctAnswerIndex]
          );
        });
      }
    );
  });
}`
      }
    ]
  },
  {
    id: 'gym-store',
    name: 'GYM Ecommerce',
    type: 'Responsive ecommerce system',
    description: 'Product discovery, filtering, shopping carts, addresses, ordering, and administration.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'Responsive UI'],
    samples: [
      {
        title: 'Dynamic product filters', language: 'PHP', path: 'GYM Ecommerce/php/filter_products.php',
        description: 'Builds optional category filters with typed parameters and paginated results.',
        context: 'One endpoint supports search, price range, category selection, sorting, and pagination.',
        code: String.raw`$sql = 'SELECT id, name, image, price
        FROM products
        WHERE price BETWEEN ? AND ? AND name LIKE ?';
$params = [$priceFrom, $priceTo, $searchQuery];
$types = 'dds';

if (!empty($category)) {
    $sql .= ' AND category_id = ?';
    $params[] = $category;
    $types .= 'i';
}

$sql .= ' ORDER BY price ASC LIMIT ? OFFSET ?';
$params[] = $limit;
$params[] = $offset;
$types .= 'ii';

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);`
      },
      {
        title: 'Session-bound checkout', language: 'PHP', path: 'GYM Ecommerce/php/confirm_order.php',
        description: 'Converts only the authenticated user’s active cart into an order.',
        context: 'The user identity comes from the server session and is bound into a prepared update.',
        code: String.raw`session_start();
header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];
$stmt = $conn->prepare(
    "UPDATE cart SET status = 'ordered'
     WHERE user_id = ? AND status = 'active'"
);
$stmt->bind_param('i', $userId);

$ok = $stmt->execute();
echo json_encode([
    'status' => $ok ? 'success' : 'error',
    'message' => $ok ? 'Your items are on their way!' : 'Order failed'
]);`
      }
    ]
  },
  {
    id: 'hospital',
    name: 'Digital Medicine ID',
    type: 'Healthcare verification prototype',
    description: 'Medicine identification, authorization records, pharmacy reports, and role-aware administration.',
    stack: ['PHP', 'MySQL', 'HTML', 'Sessions'],
    samples: [
      {
        title: 'Role-aware navigation', language: 'HTML + PHP', path: 'Hospital/index.php',
        description: 'Protects the page with a session check and conditionally exposes administrator actions.',
        context: 'The interface changes according to the signed-in user type while preserving general reporting access.',
        code: String.raw`<?php
session_start();
if (!isset($_SESSION['name'])) {
    header('Location: login.html');
    exit;
}
?>

<nav class="navigation">
  <a href="index.php">Home</a>
  <?php if ($_SESSION['type'] == 0): ?>
    <a href="saveNewMedicine.php">Add Medicine</a>
    <a href="fetchReportedPharmacies.php">Reported Pharmacies</a>
  <?php endif; ?>
  <a href="reportPharmacy.php">Report Pharmacy</a>
  <a href="php/logout.php">Logout</a>
</nav>`
      }
    ]
  },
  {
    id: 'all-lebnene',
    name: 'All Lebnene 2.0',
    type: 'Real-time multiplayer quiz',
    description: 'Room creation, player turns, synchronized cards, live scoreboards, and Lebanese-themed questions.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'Server-Sent Events'],
    samples: [
      {
        title: 'No-repeat card selection', language: 'JavaScript', path: 'All Lebnene - 2.0/js/gameRoom.js',
        description: 'Randomly selects question cards while avoiding cards already used in the room.',
        context: 'Each selected card updates the shared question state so every player sees the same round.',
        code: String.raw`let usedCards = [];
let currentCards = a;
let openCard;

function pickCard() {
  const randomIndex = Math.floor(Math.random() * currentCards.length);
  openCard = currentCards[randomIndex];

  if (usedCards.includes(openCard.id)) {
    pickCard();
    return;
  }

  document.getElementById('card-type').textContent = openCard.type;
  document.getElementById('card-question').textContent = openCard.question;
  usedCards.push(openCard.id);
  callUpdateQuestion(openCard.id);
}`
      },
      {
        title: 'Live room synchronization', language: 'JavaScript', path: 'All Lebnene - 2.0/js/gameRoom.js',
        description: 'Consumes server-sent room state to synchronize scores, turns, and active questions.',
        context: 'A persistent event stream updates every open game screen without manual refreshing.',
        code: String.raw`const events = new EventSource(
  'dataBase/gameRoom.php?room_code=' + encodeURIComponent(roomCode) +
  '&function_name=serverSentEvents'
);

events.onmessage = event => {
  const gameState = JSON.parse(event.data);

  document.getElementById('php-score-board').innerHTML = gameState.ScoreBoard;
  document.getElementById('Player-Turn').textContent =
    'Did Player ' + gameState.PlayerTurn + ' answer the question?';

  const card = currentCards.find(item => item.id == gameState.questionId);
  if (card) {
    document.getElementById('card-type').textContent = card.type;
    document.getElementById('card-question').textContent = card.question;
  }
};`
      }
    ]
  },
  {
    id: 'tank',
    name: 'Tank Combat AI',
    type: 'Unity game systems',
    description: 'Procedural maze combat with autonomous tanks, navigation, turrets, spawning, and homing projectiles.',
    stack: ['Unity', 'C#', 'Pathfinding', 'Physics'],
    samples: [
      {
        title: 'Breadth-first pathfinding', language: 'C#', path: 'Unity Games/Tank/Scripts/MazePathfinding.cs',
        description: 'Searches traversable maze cells and reconstructs the shortest discovered route.',
        context: 'The pathfinder is separated from movement, allowing tanks and projectiles to reuse it.',
        code: String.raw`public static List<Vector2Int> FindPath(Vector2Int start, Vector2Int goal)
{
    var maze = MazeMapGenerator.Instance;
    var queue = new Queue<Vector2Int>();
    var cameFrom = new Dictionary<Vector2Int, Vector2Int>();

    queue.Enqueue(start);
    cameFrom[start] = start;

    while (queue.Count > 0)
    {
        var current = queue.Dequeue();
        if (current == goal) break;

        foreach (var direction in dirs)
        {
            var next = current + direction;
            if (maze.IsBlocked(current, next) || cameFrom.ContainsKey(next)) continue;
            queue.Enqueue(next);
            cameFrom[next] = current;
        }
    }

    var path = new List<Vector2Int>();
    if (!cameFrom.ContainsKey(goal)) return path;

    for (var step = goal; step != start; step = cameFrom[step]) path.Add(step);
    path.Reverse();
    return path;
}`
      },
      {
        title: 'Homing navigation', language: 'C#', path: 'Unity Games/Tank/Scripts/HomingProjectile.cs',
        description: 'Retargets the nearest enemy and periodically recalculates a maze-aware projectile route.',
        context: 'Repath timing balances responsive pursuit with the cost of repeatedly searching the maze.',
        code: String.raw`void Update()
{
    if (target == null) return;

    timer += Time.deltaTime;
    if (timer >= repathRate)
    {
        RecalculatePath();
        timer = 0f;
    }
    FollowPath();
}

void RecalculatePath()
{
    var maze = MazeMapGenerator.Instance;
    Vector2Int start = maze.WorldToCell(transform.position);
    Vector2Int goal = maze.WorldToCell(target.position);

    path = MazePathfinding.FindPath(start, goal);
    pathIndex = 0;
}`
      }
    ]
  },
  {
    id: 'adventure-2d',
    name: '2D Adventure',
    type: 'Unity gameplay prototype',
    description: 'Player movement, responsive jumping, attacks, NPC conversations, questions, doors, and camera tracking.',
    stack: ['Unity', 'C#', '2D Physics', 'Coroutines'],
    samples: [
      {
        title: 'Coyote-time jumping', language: 'C#', path: 'Unity Games/2D Game/Scrips/PlayerController.cs',
        description: 'Combines ground checks, coyote time, and an extra jump for more forgiving movement.',
        context: 'The controller separates frame input from physics movement and drives animation state alongside it.',
        code: String.raw`isGrounded = Physics2D.OverlapCircle(
    groundCheck.position,
    groundCheckRadius,
    groundLayer
);

if (isGrounded && rb.velocity.y <= 0)
{
    coyoteTimeCounter = coyoteTime;
    jumpsLeft = extraJumps;
}
else
{
    coyoteTimeCounter -= Time.deltaTime;
}

if (!isAttacking && Input.GetKeyDown(KeyCode.Space))
{
    if (coyoteTimeCounter > 0f)
    {
        Jump();
        coyoteTimeCounter = 0f;
    }
    else if (jumpsLeft > 0)
    {
        Jump();
        jumpsLeft--;
    }
}`
      },
      {
        title: 'Data-driven NPC dialogue', language: 'C#', path: 'Unity Games/2D Game/Scrips/NPCDialogue.cs',
        description: 'Processes a configured sequence of messages and questions while retaining named results.',
        context: 'Dialogue content lives in inspector data, so conversations can change without rewriting the controller.',
        code: String.raw`foreach (DialogueItem item in dialogueSequence)
{
    if (item.type == DialogueType.Message)
    {
        messageBox.SetMessage(item.message);
        messageBox.ShowMessage();
        yield return new WaitForSeconds(messageDuration);
    }
    else if (item.type == DialogueType.Question && item.question != null)
    {
        NPCQuestion question = item.question;

        if (!questionResults.ContainsKey(question.resultVariableName))
            questionResults[question.resultVariableName] = false;

        string questionText = question.questionText + "\n";
        for (int i = 0; i < question.options.Length; i++)
            questionText += (i + 1) + ") " + question.options[i] + "\n";

        messageBox.SetMessage(questionText);
        messageBox.ShowMessage();
        // Input, validation, and feedback continue in the source file.
    }
}`
      }
    ]
  },
  {
    id: 'car-sim',
    name: 'Car Simulation',
    type: 'Unity racing prototype',
    description: 'An expanding race track with AI vehicles, abilities, race timing, camera control, and cleanup systems.',
    stack: ['Unity', 'C#', '3D Physics', 'Coroutines'],
    samples: [
      {
        title: 'Procedural track extension', language: 'C#', path: 'Unity Games/Small Car Simulation Project/Scripts/raceCar/AddTrack.cs',
        description: 'Adds road segments ahead of a moving car and advances the navigation surface and trigger.',
        context: 'Track generation is activated by vehicle progress, keeping the playable road moving forward.',
        code: String.raw`void OnTriggerEnter(Collider other)
{
    if (!other.CompareTag("car") || ScriptStatus || !RaceStatus) return;

    ScriptStatus = true;
    StartCoroutine(ResetTrigger());

    Instantiate(Track_1, new Vector3(0, 0, lastTrackLocation), Quaternion.identity);
    Instantiate(Track_1, new Vector3(0, 0, lastTrackLocation + 30), Quaternion.identity);
    Instantiate(Track_1, new Vector3(0, 0, lastTrackLocation + 60), Quaternion.identity);

    navMash.transform.position += new Vector3(0, 0, 60);
    transform.position += new Vector3(0, 0, 60);
    lastTrackLocation += 60;
}`
      },
      {
        title: 'Segment cleanup', language: 'C#', path: 'Unity Games/Small Car Simulation Project/Scripts/raceCar/track.cs',
        description: 'Detects completed track segments and removes them after a delay.',
        context: 'Cleaning older geometry prevents an endless race from retaining every generated segment.',
        code: String.raw`void OnTriggerEnter(Collider other)
{
    if (other.CompareTag("TrackEnd"))
    {
        carNumber += 1;
        if (carNumber == 1)
            StartCoroutine(DestroyTrackAfterDelay());
    }
}

IEnumerator DestroyTrackAfterDelay()
{
    yield return new WaitForSeconds(15f);
    Destroy(transform.parent.gameObject);
}`
      }
    ]
  },
  {
    id: 'slot-machine',
    name: 'Slot Machine',
    type: 'Unity interaction prototype',
    description: 'Weighted symbols, reel animation, payouts, multipliers, free spins, win feedback, audio, and lighting.',
    stack: ['Unity', 'C#', 'Coroutines', 'UI Animation'],
    samples: [
      {
        title: 'Payout calculation', language: 'C#', path: 'Unity Games/Slot Machine/Scripts/SlotController.cs',
        description: 'Counts reel results while accumulating multiplier and bonus effects.',
        context: 'Payout calculation is isolated from reel animation so game rules stay easier to test and tune.',
        code: String.raw`private float CalculatePayout(out Dictionary<Sprite, int> counts,
    out int multiplierTotal, out int bonusSpins)
{
    counts = new Dictionary<Sprite, int>();
    multiplierTotal = 1;
    bonusSpins = 0;

    foreach (var reel in reels)
    foreach (var symbol in reel.finalResults)
    {
        if (counts.ContainsKey(symbol.image)) counts[symbol.image]++;
        else counts[symbol.image] = 1;

        foreach (var multiplier in multipliers)
            if (symbol.image == multiplier.image)
                multiplierTotal *= multiplier.multiplier;

        foreach (var bonus in bonuses)
            if (symbol.image == bonus.image)
                bonusSpins += bonus.freeSpins;
    }

    float totalPayout = 0f;
    foreach (var pair in counts)
    {
        if (pair.Value >= 5)
        {
            Symbol symbol = GetSymbolFromSprite(pair.Key);
            totalPayout += pair.Value * symbol.value;
        }
    }

    return totalPayout;
}`
      },
      {
        title: 'Ambient light animation', language: 'C#', path: 'Unity Games/Slot Machine/Scripts/RandomLightEffects.cs',
        description: 'Smoothly blends randomized colors while pulsing light intensity over time.',
        context: 'A reusable component gives the machine synchronized visual atmosphere without timeline assets.',
        code: String.raw`void Update()
{
    timer += Time.deltaTime;
    if (timer >= changeColorEvery)
    {
        PickNewColor();
        timer = 0f;
    }

    foreach (Light light in lights)
    {
        if (light == null) continue;

        light.color = Color.Lerp(
            light.color,
            targetColor,
            Time.deltaTime * colorChangeSpeed
        );

        float pulse = Mathf.PingPong(Time.time * pulseSpeed, 1f);
        light.intensity = Mathf.Lerp(minIntensity, maxIntensity, pulse);
    }
}`
      }
    ]
  },
  {
    id: 'portfolio',
    name: 'Developer Portfolio',
    type: 'Responsive frontend experience',
    description: 'A custom portfolio with project storytelling, responsive navigation, motion, and this searchable source browser.',
    stack: ['HTML', 'CSS', 'JavaScript', 'Accessibility'],
    samples: [
      {
        title: 'Progressive reveal', language: 'JavaScript', path: 'My Own Portfolio/script.js',
        description: 'Reveals content only when it enters the viewport and then stops observing it.',
        context: 'Intersection Observer provides efficient scroll motion while reduced-motion preferences remain respected.',
        code: String.raw`const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealElements.forEach(element => observer.observe(element));`
      },
      {
        title: 'Responsive code workbench', language: 'CSS', path: 'My Own Portfolio/styles.css',
        description: 'Creates a two-column source browser that collapses cleanly for smaller screens.',
        context: 'The layout preserves readable code, reachable controls, and horizontal scrolling only inside the editor.',
        code: String.raw`.code-library {
  display: grid;
  grid-template-columns: minmax(230px, 0.32fr) minmax(0, 1fr);
  min-height: 760px;
  overflow: hidden;
  border: 1px solid rgba(87, 217, 255, 0.2);
  border-radius: 22px;
  background: rgba(8, 10, 17, 0.92);
}

@media (max-width: 900px) {
  .code-library { grid-template-columns: 1fr; }
  .code-project-list {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x proximity;
  }
  .code-project-button { min-width: 220px; }
}`
      }
    ]
  }
];

window.codeShowcaseProjects = codeShowcaseProjects;
